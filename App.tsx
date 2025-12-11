
import React, { useState, useEffect, useRef } from 'react';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import MessageComponent from './components/Message';
import QuickButtons from './components/QuickButtons';
import BouncingLogo from './components/BouncingLogo';
import Aura from './components/Aura';
import SplashScreen from './components/SplashScreen';
import WelcomeScreen from './components/auth/WelcomeScreen';
import LoginScreen from './components/auth/LoginScreen';
import SignUpScreen from './components/auth/SignUpScreen';
import ForgotPasswordScreen from './components/auth/ForgotPasswordScreen';
import SocialInfoModal from './components/auth/SocialInfoModal';
import ProfileModal from './components/auth/ProfileModal';
import PremiumModal from './components/PremiumModal';
import AboutModal from './components/AboutModal';
import CameraModal from './components/CameraModal';
import ImageEditor from './components/ImageEditor';
import UploadMenu from './components/UploadMenu';
import PremiumPromptToast from './components/PremiumPromptToast';
import ProfileImageCropper from './components/ProfileImageCropper';
import ImageGenerationModal from './components/ImageGenerationModal';
import LibraryModal from './components/LibraryModal';
import LimitToast from './components/LimitToast';


// Types
import { 
    User, 
    AuthState, 
    AuthProvider, 
    AuraState, 
    AuraIntensity, 
    ScreenCrackState, 
    AuraSuggestion,
    Conversation,
    ImageState,
    Message,
    VoiceOption,
    GalleryItem,
    LearningLevel
} from './types';

// Services
import { authService } from './services/authService';
import { geminiService } from './services/geminiService';

const PREMIUM_ACCESS_CODE = 'WESTLINEPRO';
const INITIAL_QUICK_PROMPTS = [
    'Suggest a creative project for social media',
    'What are some good color palettes for a tech brand?',
    'Explain what a motion graphic is',
    'How can I monetize my design skills?',
];


const App: React.FC = () => {
    // Auth State
    const [authState, setAuthState] = useState<AuthState>('splash');
    const [user, setUser] = useState<User | null>(null);
    const [socialInfo, setSocialInfo] = useState<{name: string, email: string} | null>(null);

    // UI/Modal State
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGenModalOpen, setIsGenModalOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
    const [isLevelMenuOpen, setIsLevelMenuOpen] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    
    // Limit Toast State
    const [limitToast, setLimitToast] = useState<{isOpen: boolean, renewalTime: string, actionType: 'Generate' | 'Edit'}>({
        isOpen: false,
        renewalTime: '',
        actionType: 'Generate'
    });


    // Aura & Effects State
    const [currentAura, setCurrentAura] = useState<AuraState>('Off');
    const [intensity, setIntensity] = useState<AuraIntensity>('Medium');
    const [reduceMotion, setReduceMotion] = useState(false);
    const [screenCrackEffect, setScreenCrackEffect] = useState<ScreenCrackState | null>(null);
    const [auraSuggestion, setAuraSuggestion] = useState<AuraSuggestion | null>(null);
    const [isShockwaveActive, setIsShockwaveActive] = useState(false);
    const [learningLevel, setLearningLevel] = useState<LearningLevel>('Absolute Beginner');


    // Chat State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [input, setInput] = useState('');
    const [quickPrompts, setQuickPrompts] = useState<string[]>(INITIAL_QUICK_PROMPTS);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);


    // Image Editing & Upload State
    const [imageToEdit, setImageToEdit] = useState<ImageState | null>(null);
    const [editedImage, setEditedImage] = useState<ImageState | null>(null);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [editedImageFeedback, setEditedImageFeedback] = useState<'like' | 'dislike' | null>(null);
    const [cameraTarget, setCameraTarget] = useState<'editor' | 'profile'>('editor');
    const [uploadTarget, setUploadTarget] = useState<'editor' | 'profile'>('editor');
    const [pendingProfilePicture, setPendingProfilePicture] = useState<string | null>(null);
    const [rawProfileImage, setRawProfileImage] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadMenuRef = useRef<HTMLDivElement>(null);
    const uploadButtonRef = useRef<HTMLButtonElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- Effects ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);
    useEffect(scrollToBottom, [activeConversation?.messages]);

    // Splash screen and auth check on initial load
    useEffect(() => {
        const timer = setTimeout(() => {
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                handleAuthenticationSuccess(currentUser);
            } else {
                setAuthState('welcome');
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Load conversations when user logs in
    useEffect(() => {
        if (user) {
            const userConvos = authService.getConversationsForUser(user.email);
            // FILTER: Clean up any empty conversations to prevent history clutter
            const validConvos = userConvos.filter(c => c.messages.length > 0);
            
            setConversations(validConvos);
            if (validConvos.length > 0) {
                // Determine the most recent chat to show
                const sorted = [...validConvos].sort((a, b) => b.timestamp - a.timestamp);
                setActiveConversationId(sorted[0].id);
            } else {
                setActiveConversationId(null); // No chats initially
            }
            setHistoryLoaded(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Save conversations whenever they change
    useEffect(() => {
        if (user && historyLoaded) {
            // Ensure we don't save ephemeral empty chats if possible, though state management handles UI
            authService.saveConversationsForUser(user.email, conversations);
        }
    }, [conversations, user, historyLoaded]);

    // Handle clicks outside the upload menu to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isUploadMenuOpen &&
                uploadMenuRef.current &&
                !uploadMenuRef.current.contains(event.target as Node) &&
                uploadButtonRef.current &&
                !uploadButtonRef.current.contains(event.target as Node)
            ) {
                setIsUploadMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isUploadMenuOpen]);
    
    // Apply theme class to body
    useEffect(() => {
        const body = document.body;
        body.classList.remove('theme-light', 'theme-dark');
        if (user?.theme) {
            body.classList.add(`theme-${user.theme}`);
        } else {
            body.classList.add('theme-dark'); // Default theme
        }
    }, [user?.theme]);
    
    // Sync reduceMotion state with user preferences
    useEffect(() => {
        if (user && user.preferences) {
            setReduceMotion(user.preferences.reduceMotion);
        }
    }, [user]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setInput(prev => prev ? `${prev} ${finalTranscript}` : finalTranscript);
                }
            };
            
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                 // Automatically restart if user hasn't toggled it off? 
                 // For now, let's just update state to false if it stopped unexpectedly.
                 if (isListening) setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // Generate dynamic quick prompts for new chats
    useEffect(() => {
        const updatePromptsForNewChat = async () => {
            // Find the most recently active conversation that is NOT the current one
            const mostRecentConvo = conversations
                .filter(c => c.id !== activeConversationId && c.messages.length > 0)
                .sort((a, b) => b.timestamp - a.timestamp)[0];

            if (mostRecentConvo) {
                try {
                    const newPrompts = await geminiService.generateDynamicPrompts(mostRecentConvo.messages);
                     if (newPrompts && newPrompts.length > 0) {
                        setQuickPrompts(newPrompts);
                    } else {
                        setQuickPrompts(INITIAL_QUICK_PROMPTS);
                    }
                } catch (error) {
                    console.error("Failed to generate dynamic prompts:", error);
                    setQuickPrompts(INITIAL_QUICK_PROMPTS);
                }
            } else {
                // No other conversations, use default
                setQuickPrompts(INITIAL_QUICK_PROMPTS);
            }
        };

        const activeConvo = conversations.find(c => c.id === activeConversationId);
        // If there is no active conversation (fresh state) or the active one is empty
        if (!activeConversationId || (activeConvo && activeConvo.messages.length === 0)) {
            updatePromptsForNewChat();
        }
    }, [activeConversationId, conversations]);


    // --- Handlers ---
    
    const handleAuthenticationSuccess = (authedUser: User) => {
        // Ensure tracking fields are initialized for existing users
        const safeUser = { 
            ...authedUser, 
            imageGenerationCount: authedUser.imageGenerationCount || 0,
            imageEditCount: authedUser.imageEditCount || 0,
            usageWindowStart: authedUser.usageWindowStart || Date.now()
        };
        setUser(safeUser);
        setAuthState('authenticated');
        if (safeUser.preferences?.learningLevel) {
            setLearningLevel(safeUser.preferences.learningLevel);
        }
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setConversations([]);
        setActiveConversationId(null);
        setAuthState('welcome');
        setIsMenuOpen(false);
        setHistoryLoaded(false);
    };

    const handleNavigate = (screen: AuthState) => {
        setAuthState(screen);
    };
    
    const handleSocialLogin = (provider: AuthProvider) => {
        // Open the modal with blank fields for the user to fill in.
        setSocialInfo({ name: '', email: '' });
    };

    const handleSocialConfirm = (name: string, email: string) => {
        const user = authService.signInWithProvider('Google', name, email);
        setSocialInfo(null);
        handleAuthenticationSuccess(user);
    };

    const handleUnlockPremium = (code: string): boolean => {
        if (code === PREMIUM_ACCESS_CODE && user) {
            triggerShockwave();
            const updatedUser = { ...user, isPremium: true };
            authService.updateUser(updatedUser);
            setUser(updatedUser);
            setIsPremiumModalOpen(false);
            return true;
        }
        return false;
    };

    const handleProfileUpdate = (updatedFields: Partial<User>, closeModal = true) => {
        if (!user) return;
        
        let updatedUser = { ...user, ...updatedFields };

        if (updatedFields.preferences) {
            updatedUser.preferences = { ...user.preferences, ...updatedFields.preferences };
        }
        
        authService.updateUser(updatedUser);
        setUser(updatedUser);
        
        if (closeModal) {
            setIsProfileModalOpen(false);
            setPendingProfilePicture(null);
        }
    };

    const handleVoiceChange = (voice: VoiceOption) => {
        if (user) {
            handleProfileUpdate({ preferences: { ...user.preferences, voice, reduceMotion: user.preferences?.reduceMotion || false } }, false);
        }
    };
    
    const handleReduceMotionChange = (reduce: boolean) => {
        setReduceMotion(reduce);
        if (user) {
            handleProfileUpdate({ preferences: { ...user.preferences, reduceMotion: reduce } }, false);
        }
    };

    const handleRenameConversation = (id: string, newTitle: string) => {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    
    // Chat Handlers
     const updateMessages = (convoId: string, updateFn: (messages: Message[]) => Message[]) => {
        setConversations(prevConvos => 
            prevConvos.map(c => 
                c.id === convoId ? { ...c, messages: updateFn(c.messages) } : c
            )
        );
    };

    const handleSendMessage = async (prompt?: string, isHidden: boolean = false, overrideLevel?: LearningLevel) => {
        const messageText = (prompt || input).trim();
        // Allow hidden prompts to bypass isLoading check if needed, or manage queue
        if (!messageText || (isLoading && !isHidden)) return;
        
        // Stop listening if sending
        if(isListening) {
             toggleListening();
        }

        let currentConvoId = activeConversationId;

        // If no active conversation, create one NOW
        if (!currentConvoId) {
            currentConvoId = `convo_${Date.now()}`;
            const newConvo: Conversation = {
                id: currentConvoId,
                title: 'New Chat', // Will be updated shortly
                messages: [],
                timestamp: Date.now(),
                isPinned: false
            };
            setConversations(prev => [newConvo, ...prev]);
            setActiveConversationId(currentConvoId);
            
            // Generate Title for this new chat if not hidden prompt
            if (!isHidden) {
                geminiService.generateChatTitle(messageText).then(title => {
                    setConversations(prev => prev.map(c => c.id === currentConvoId ? { ...c, title } : c));
                });
            }
        }

        const userMessage: Message = { id: `msg_${Date.now()}`, text: messageText, sender: 'user', isFinal: true, timestamp: Date.now() };
        
        // Helper to update state even if we just created it
        const updateConvoState = (updater: (prev: Conversation[]) => Conversation[]) => {
            setConversations(updater);
        };

        if (!isHidden) {
             updateConvoState(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, userMessage], timestamp: Date.now() } : c));
             setInput('');
        }
        
        setIsLoading(true);

        const botMessageId = `msg_${Date.now() + 1}`;
        const botMessage: Message = { id: botMessageId, text: '', sender: 'bot', isFinal: false, timestamp: Date.now() };
        
        updateConvoState(prev => prev.map(c => c.id === currentConvoId ? { ...c, messages: [...c.messages, botMessage] } : c));

        // Get the updated conversation for history context
        const convoForHistory = conversations.find(c => c.id === currentConvoId) || { messages: [] };
        // We need to include the message we just added (which might not be in state yet fully due to closure)
        const messagesHistory = [...convoForHistory.messages];
        if (!isHidden) {
            messagesHistory.push(userMessage);
        }

        // Non-premium users get a prompt after 2 messages (don't show for hidden system prompts)
        if (!isHidden && user && !user.isPremium && messagesHistory.length > 2) {
             setTimeout(() => setShowPremiumPrompt(true), 2000);
        }

        const history = messagesHistory.map(m => ({
            role: m.sender === 'user' ? 'user' : 'model' as 'user' | 'model',
            parts: [{ text: m.text }]
        }));

        try {
            // Use overrideLevel if provided, otherwise current learningLevel
            const levelToUse = overrideLevel || learningLevel;
            const stream = geminiService.streamResponse(messageText, history, currentAura, user?.isPremium || false, levelToUse);
            let logoSent = false;
    
            for await (const chunk of stream) {
                if (logoSent) continue;
    
                updateConvoState(prev => prev.map(c => 
                    c.id === currentConvoId ? {
                        ...c,
                        messages: c.messages.map(m => {
                             if (m.id !== botMessageId) return m;
    
                            const newText = m.text + chunk;
                            
                            if (newText.includes(geminiService.LOGO_TOKEN)) {
                                logoSent = true;
                                return {
                                    ...m,
                                    text: "Here is the high-quality WestlineGPT logo you requested!",
                                    image: {
                                        data: geminiService.getLogoDataUrl(),
                                        mimeType: 'image/svg+xml'
                                    }
                                };
                            }
                            return { ...m, text: newText };
                        })
                    } : c
                ));
            }
        } catch (error) {
            console.error(error);
             updateConvoState(prev => prev.map(c => 
                c.id === currentConvoId ? {
                    ...c,
                    messages: c.messages.map(m => m.id === botMessageId ? { ...m, text: "Sorry, something went wrong." } : m)
                } : c
            ));
        } finally {
            setIsLoading(false);
            updateConvoState(prev => prev.map(c => 
                c.id === currentConvoId ? {
                    ...c,
                    messages: c.messages.map(m => m.id === botMessageId ? { ...m, isFinal: true } : m)
                } : c
            ));
        }
    };

    const handleNewChat = () => {
        // Just deselect current conversation.
        // A new one will only be created when the user actually sends a message.
        setActiveConversationId(null);
        setInput('');
        setIsMenuOpen(false);
    };
    
    const handleSelectConversation = (id: string) => {
        setActiveConversationId(id);
        setIsMenuOpen(false);
    };

    const handleDeleteConversation = (id: string) => {
        setConversations(prev => {
            const remainingConvos = prev.filter(c => c.id !== id);
            if (activeConversationId === id) {
                 if(remainingConvos.length > 0){
                    setActiveConversationId(remainingConvos[0].id);
                 } else {
                     setActiveConversationId(null);
                 }
            }
            return remainingConvos;
        });
    };
    
    const handlePinConversation = (id: string) => {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned: !c.isPinned } : c));
    };

    const handleClearHistory = () => {
        if (user) {
            authService.saveConversationsForUser(user.email, []);
        }
        setConversations([]);
        setActiveConversationId(null);
        setIsMenuOpen(false);
    };
    
    const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
        if (!activeConversationId) return;
        updateMessages(activeConversationId, (msgs) =>
            msgs.map(m => m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m)
        );
        if (feedback === 'dislike') {
            triggerShockwave();
        }
    };


    // Aura Handlers
    const handleAuraChange = (aura: AuraState) => {
        setCurrentAura(aura);
    };
    
    const handleAuraSuggestion = (suggestion: AuraSuggestion) => {
        setAuraSuggestion(suggestion);
    };
    
    const handleAcceptAuraSuggestion = () => {
        if (auraSuggestion) {
            if (auraSuggestion.isPremium && !user?.isPremium) {
                setIsPremiumModalOpen(true);
            } else {
                setCurrentAura(auraSuggestion.aura);
            }
        }
        setAuraSuggestion(null);
    };

    // Effects handlers
    const triggerScreenCrack = () => {
        // Activate "Thunder" effect (reusing the screenCrack logic but changing visuals in Aura.tsx)
        setScreenCrackEffect({ key: Date.now(), active: true, baseAura: currentAura, intensity });
        
        setTimeout(() => {
            setScreenCrackEffect(prev => (prev ? { ...prev, active: false } : null));
        }, 600); // Shorter duration for lightning flash (0.6s)
    };
    
    const triggerShockwave = () => {
        setIsShockwaveActive(true);
        // Add class to body for global shake
        document.body.classList.add('impact-mode');
        
        // Also trigger lightning for maximum chaos
        triggerScreenCrack();

        // HEAVY HAPTIC FEEDBACK (Pattern: rumble)
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50, 50, 200]);
        }

        setTimeout(() => {
            setIsShockwaveActive(false);
            document.body.classList.remove('impact-mode');
        }, 800); // Matches animation duration
    };

    const handleLearningLevelChange = (level: LearningLevel) => {
        setLearningLevel(level);
        if (user) {
            handleProfileUpdate({ preferences: { ...user.preferences, learningLevel: level } }, false);
        }
        
        // Trigger Shockwave Effect
        triggerShockwave();
        
        // Trigger Automatic Welcome Message
        // Use a slight timeout to ensure state settles and effect is visible first
        setTimeout(() => {
            const prompt = `[SYSTEM EVENT: Level Changed to "${level}"]
            You are WestlineGPT. The user has just selected the "${level}" learning level.
            Task:
            1. Welcome the user to the ${level} level.
            2. Briefly explain what they will achieve here (based on the level description).
            3. Provide a short, punchy motivation in the Westline Techlabs tone (Innovative, Empowering, "Smart Way").
            4. Keep it concise and encouraging.`;
            
            handleSendMessage(prompt, true, level);
        }, 800);
    };

    
    // --- LIMIT CHECKING LOGIC ---
    const checkUsageLimit = (type: 'generate' | 'edit'): boolean => {
        if (!user || user.isPremium) return true;

        // Sync with latest data (re-checks timestamp)
        const updatedUser = authService.checkAndResetUsage(user);
        
        // If changed, update state
        if (updatedUser.usageWindowStart !== user.usageWindowStart) {
            setUser(updatedUser);
        }

        const count = type === 'generate' ? updatedUser.imageGenerationCount : updatedUser.imageEditCount;
        const LIMIT = 6;

        if (count >= LIMIT) {
            const SIX_HOURS = 6 * 60 * 60 * 1000;
            const resetTime = updatedUser.usageWindowStart + SIX_HOURS;
            const timeString = new Date(resetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            setLimitToast({
                isOpen: true,
                renewalTime: timeString,
                actionType: type === 'generate' ? 'Generate' : 'Edit'
            });
            return false;
        }
        
        // Increment and Save
        const nextUser = { 
            ...updatedUser, 
            [type === 'generate' ? 'imageGenerationCount' : 'imageEditCount']: count + 1 
        };
        authService.updateUser(nextUser);
        setUser(nextUser);
        return true;
    };


    // Image Handlers
    const handleImageUploadClick = () => {
        setUploadTarget('editor');
        fileInputRef.current?.click();
    };
    
    const handleGenerateImageClick = () => {
        setIsGenModalOpen(true);
        setIsUploadMenuOpen(false);
    };
    
    const handleGeneratedImageSelected = (image: ImageState) => {
        // Logic handled inside modal for limit checking before generation
        // Here we just accept the result
        setImageToEdit(image);
        setEditedImage(null);
        setEditedImageFeedback(null);
        setIsGenModalOpen(false);
        
        // NOTE: We do NOT increment here anymore, we do it in checkUsageLimit inside Modal
    };

    const handleImageFileSelected = (file: File | null) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target?.result as string;
                if (dataUrl) {
                    if (uploadTarget === 'profile') {
                        // Open Cropper instead of setting pending immediately
                        setRawProfileImage(dataUrl);
                    } else {
                        setImageToEdit({ data: dataUrl, mimeType: file.type });
                        setEditedImage(null);
                        setEditedImageFeedback(null);
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageCapture = (dataUrl: string, mimeType: string) => {
        setIsCameraModalOpen(false);
        if (cameraTarget === 'profile') {
            // Open Cropper instead of setting pending immediately
            setRawProfileImage(dataUrl);
        } else {
            setImageToEdit({ data: dataUrl, mimeType: mimeType });
            setEditedImage(null);
            setEditedImageFeedback(null);
        }
    };
    
    const handleCropComplete = (croppedImageUrl: string) => {
        setPendingProfilePicture(croppedImageUrl);
        setRawProfileImage(null);
        setIsProfileModalOpen(true); // Ensure modal is visible
    };

    const handleCropCancel = () => {
        setRawProfileImage(null);
    };
    
    const handleClearImage = () => {
        setImageToEdit(null);
        setEditedImage(null);
        setEditedImageFeedback(null);
    };
    
    const processImageEdit = async (prompt: string) => {
        if (!imageToEdit) return;
        
        // Check Limit
        if (!checkUsageLimit('edit')) return;
        
        setIsEditingImage(true);
        setEditedImage(null);
        const result = await geminiService.editImage(prompt, imageToEdit.data, imageToEdit.mimeType);
        setIsEditingImage(false);

        if (result) {
            const newDataUrl = `data:${result.mimeType};base64,${result.data}`;
            setEditedImage({ data: newDataUrl, mimeType: result.mimeType });
        }
    };
    
    const handleImageFeedback = (feedback: 'like' | 'dislike') => {
        setEditedImageFeedback(prev => prev === feedback ? null : feedback);
    };
    
    const handleLibraryEdit = (image: GalleryItem) => {
        setImageToEdit({ data: image.data, mimeType: image.mimeType });
        setEditedImage(null);
        setEditedImageFeedback(null);
    };


    // Render Logic
    const displayAura = authState === 'authenticated' ? currentAura : (socialInfo ? 'Ice Drip' : 'Rain');
    const displayIntensity = authState === 'authenticated' ? intensity : 'Medium';

    if (authState === 'splash') {
        return (
            <div className="h-screen font-sans flex flex-col">
                <Aura currentAura="Rain" intensity="Medium" reduceMotion={false} screenCrackEffect={null} />
                <SplashScreen />
            </div>
        );
    }
    
    const activeMessages = activeConversation?.messages || [];

    return (
        <div className={`h-screen font-sans flex flex-col transition-colors duration-1000`}>
            
            {isShockwaveActive && (
                <>
                    <div className="shockwave" />
                    <div className="flash-overlay" />
                </>
            )}
            <Aura currentAura={displayAura} intensity={displayIntensity} reduceMotion={reduceMotion} screenCrackEffect={screenCrackEffect} />

            {authState !== 'authenticated' && (
                <main className="flex-1 flex flex-col justify-center">
                    {authState === 'welcome' && <WelcomeScreen onNavigate={handleNavigate} onSocialLogin={handleSocialLogin} />}
                    {authState === 'login' && <LoginScreen onLoginSuccess={handleAuthenticationSuccess} onNavigate={handleNavigate} onSocialLogin={handleSocialLogin} />}
                    {authState === 'signup' && <SignUpScreen onSignUpSuccess={handleAuthenticationSuccess} onNavigate={handleNavigate} onSocialLogin={handleSocialLogin} />}
                    {authState === 'forgotPassword' && <ForgotPasswordScreen onNavigate={handleNavigate} />}
                </main>
            )}

            {authState === 'authenticated' && user && (
                <>
                    <Header
                        user={user}
                        onLogout={handleLogout}
                        conversations={conversations}
                        activeConversationId={activeConversationId}
                        onSelectConversation={handleSelectConversation}
                        onNewChat={handleNewChat}
                        onDeleteConversation={handleDeleteConversation}
                        onPinConversation={handlePinConversation}
                        onRenameConversation={handleRenameConversation}
                        onClearHistory={handleClearHistory}
                        currentAura={currentAura}
                        onAuraChange={handleAuraChange}
                        intensity={intensity}
                        onIntensityChange={setIntensity}
                        reduceMotion={reduceMotion}
                        onReduceMotionChange={handleReduceMotionChange}
                        onVoiceChange={handleVoiceChange}
                        learningLevel={learningLevel}
                        onLevelChange={handleLearningLevelChange}
                        onAboutClick={() => setIsAboutModalOpen(true)}
                        onPremiumClick={() => setIsPremiumModalOpen(true)}
                        onProfileClick={() => setIsProfileModalOpen(true)}
                        onTriggerImpact={triggerShockwave}
                        onContactClick={() => { /* TODO */ }}
                        isMenuOpen={isMenuOpen}
                        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
                        isLevelMenuOpen={isLevelMenuOpen}
                        onLevelMenuToggle={() => setIsLevelMenuOpen(!isLevelMenuOpen)}
                    />
                    
                    {imageToEdit ? (
                         <main className={`flex-1 flex flex-col pt-20 transition-all duration-300 ${isMenuOpen || isLevelMenuOpen ? 'content-blur' : ''}`}>
                            <ImageEditor
                                originalImage={imageToEdit}
                                editedImage={editedImage}
                                onClose={handleClearImage}
                                onEdit={processImageEdit}
                                isLoading={isEditingImage}
                                feedback={editedImageFeedback}
                                onFeedback={handleImageFeedback}
                            />
                        </main>
                    ) : (
                        <main className={`flex-1 flex flex-col overflow-hidden pt-24 pb-6 md:pb-10 transition-all duration-300 ${isMenuOpen || isLevelMenuOpen ? 'content-blur' : ''}`}>
                             <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex-1 overflow-y-auto scroll-smooth min-h-0 scroll-mask">
                                    <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-4">
                                        {activeMessages.length === 0 && !isLoading ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center pb-10 min-h-[60vh]">
                                                <div className="w-24 h-24 mt-4 relative">
                                                    <BouncingLogo />
                                                </div>
                                                <div className="mt-4">
                                                    <div className="mt-4">
                                                        <h2 className="text-2xl font-bold text-slate-200">Welcome back, {user.name.split(' ')[0]}!</h2>
                                                        <p className="text-slate-400 font-light mt-1">How can I help you create today?</p>
                                                    </div>
                                                </div>
                                                <div className="max-w-2xl w-full mt-12">
                                                    <QuickButtons prompts={quickPrompts} onQuickButtonClick={(text) => handleSendMessage(text)} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {activeMessages.map(msg => (
                                                    <MessageComponent key={msg.id} message={msg} onFeedback={handleFeedback} voice={user.preferences?.voice} />
                                                ))}
                                                {isLoading && (
                                                    <div className="flex items-start gap-3 my-6 justify-start animate-fade-in-up">
                                                        {/* Avatar */}
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-black border border-amber-500/30 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(228,158,16,0.2)]">
                                                            <BouncingLogo />
                                                        </div>
                                                        {/* Bubble */}
                                                        <div className="flex flex-col">
                                                            <div className="px-6 py-5 rounded-2xl rounded-tl-none glass-pane relative overflow-hidden group shadow-sm" style={{'--glass-border': 'rgba(228, 158, 16, 0.3)', background: 'linear-gradient(135deg, rgba(20,20,25,0.8), rgba(40,40,45,0.4))'} as React.CSSProperties}>
                                                                 {/* Shimmer overlay */}
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>

                                                                <div className="flex items-center space-x-4 relative z-10">
                                                                    {/* Neural Wave Animation */}
                                                                    <div className="flex items-center space-x-1 h-8">
                                                                        <div className="w-1.5 bg-amber-500/80 rounded-full animate-wave [animation-delay:-0.4s]"></div>
                                                                        <div className="w-1.5 bg-amber-400/90 rounded-full animate-wave [animation-delay:-0.2s]"></div>
                                                                        <div className="w-1.5 bg-amber-300 rounded-full animate-wave [animation-delay:0s]"></div>
                                                                        <div className="w-1.5 bg-amber-400/90 rounded-full animate-wave [animation-delay:0.2s]"></div>
                                                                        <div className="w-1.5 bg-amber-500/80 rounded-full animate-wave [animation-delay:0.4s]"></div>
                                                                    </div>
                                                                    <span className="text-sm font-light text-amber-100/80 tracking-widest uppercase text-xs">Processing</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                <div className="w-full max-w-4xl mx-auto px-4 mb-2 md:mb-6">
                                    <div className="prompt-input-wrapper">
                                         <div className="bg-slate-900/80 rounded-full flex items-center w-full p-1.5 pl-3 space-x-2">
                                            <div className="relative flex-shrink-0">
                                                <button 
                                                    ref={uploadButtonRef}
                                                    onClick={() => setIsUploadMenuOpen(!isUploadMenuOpen)}
                                                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/10" 
                                                    title="Attach Image"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                                </button>
                                                {isUploadMenuOpen && (
                                                    <div ref={uploadMenuRef}>
                                                        <UploadMenu 
                                                            onUpload={() => {
                                                                handleImageUploadClick();
                                                                setIsUploadMenuOpen(false);
                                                            }}
                                                            onTakePhoto={() => {
                                                                setCameraTarget('editor');
                                                                setIsCameraModalOpen(true);
                                                                setIsUploadMenuOpen(false);
                                                            }}
                                                            onGenerateImage={handleGenerateImageClick}
                                                            onOpenLibrary={() => {
                                                                setIsLibraryOpen(true);
                                                                setIsUploadMenuOpen(false);
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => handleImageFileSelected(e.target.files ? e.target.files[0] : null)}
                                            />

                                            <textarea
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                                placeholder={isListening ? "Listening..." : "Ask Anything..."}
                                                className="flex-1 bg-transparent text-slate-200 placeholder-slate-400/80 focus:outline-none focus:ring-0 resize-none max-h-48 p-2 text-base font-light border-none no-scrollbar"
                                                rows={1}
                                                disabled={isLoading}
                                            />
                                            
                                            <button 
                                                onClick={toggleListening}
                                                className={`w-9 h-9 flex-shrink-0 flex items-center justify-center text-slate-300 hover:text-white transition-colors duration-300 rounded-full hover:bg-white/10 ${isListening ? 'animate-pulse text-red-400 bg-red-400/10' : ''}`} 
                                                title="Use Microphone"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                                                    <defs>
                                                        <linearGradient id="mic-body" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#9CA3AF" />
                                                            <stop offset="100%" stopColor="#4B5563" />
                                                        </linearGradient>
                                                        <linearGradient id="mic-grill" x1="0" y1="0" x2="1" y2="1">
                                                            <stop offset="0%" stopColor="#F3F4F6" />
                                                            <stop offset="100%" stopColor="#D1D5DB" />
                                                        </linearGradient>
                                                    </defs>
                                                    <path className="mic-grill-path" d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z" fill={isListening ? "red" : "url(#mic-grill)"} />
                                                    <path className="mic-body-path" d="M7 12C7 14.7614 9.23858 17 12 17C14.7614 17 17 14.7614 17 12H19C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12H7Z" fill="url(#mic-body)" />
                                                    <path className="mic-stand-path" d="M12 19V21M10 21H14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleSendMessage()} 
                                                disabled={isLoading || !input.trim()} 
                                                className={`w-9 h-9 flex-shrink-0 flex items-center justify-center transition-all duration-300 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transform rounded-full ${input.trim() && !isLoading ? 'bg-primary-amber text-black' : 'bg-slate-800 text-white'}`} 
                                                aria-label="Send message" 
                                                title="Send"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${input.trim() && !isLoading ? 'scale-110 -rotate-12' : ''}`} viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </main>
                    )}
                    
                    <PremiumPromptToast 
                        isOpen={showPremiumPrompt} 
                        onClose={() => setShowPremiumPrompt(false)} 
                        onUpgrade={() => {
                            setShowPremiumPrompt(false);
                            setIsPremiumModalOpen(true);
                        }} 
                    />
                    
                    <LimitToast 
                        isOpen={limitToast.isOpen}
                        onClose={() => setLimitToast(prev => ({...prev, isOpen: false}))}
                        onUpgrade={() => {
                            setLimitToast(prev => ({...prev, isOpen: false}));
                            setIsPremiumModalOpen(true);
                        }}
                        renewalTime={limitToast.renewalTime}
                        actionType={limitToast.actionType}
                    />
                </>
            )}

            {/* Modals */}
            {user && (
                 <>
                    <ProfileModal 
                        isOpen={isProfileModalOpen} 
                        onClose={() => {
                            setIsProfileModalOpen(false);
                            setPendingProfilePicture(null);
                        }}
                        user={user} 
                        pendingPicture={pendingProfilePicture}
                        onSave={handleProfileUpdate}
                        onTakePhoto={() => {
                            setCameraTarget('profile');
                            setIsCameraModalOpen(true);
                        }}
                        onUploadPhoto={() => {
                            setUploadTarget('profile');
                            fileInputRef.current?.click();
                        }}
                    />
                    <LibraryModal 
                        isOpen={isLibraryOpen}
                        onClose={() => setIsLibraryOpen(false)}
                        userEmail={user.email}
                        onEditImage={handleLibraryEdit}
                    />
                </>
            )}
            
            {rawProfileImage && (
                <ProfileImageCropper
                    imageSrc={rawProfileImage}
                    onCancel={handleCropCancel}
                    onComplete={handleCropComplete}
                />
            )}
            
            <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} onUnlock={handleUnlockPremium} />
            <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
            <CameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handleImageCapture} />
            <ImageGenerationModal 
                isOpen={isGenModalOpen} 
                onClose={() => setIsGenModalOpen(false)} 
                onImageGenerated={handleGeneratedImageSelected}
                isPremiumUser={user?.isPremium || false}
                usageCount={user?.imageGenerationCount || 0}
                onUpgrade={() => setIsPremiumModalOpen(true)}
            />
            {socialInfo && (
                <SocialInfoModal 
                    isOpen={!!socialInfo}
                    onClose={() => setSocialInfo(null)}
                    onConfirm={handleSocialConfirm}
                    initialName={socialInfo.name}
                    initialEmail={socialInfo.email}
                />
            )}
        </div>
    );
};

export default App;
