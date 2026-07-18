/* ==========================================================================
   AI-OS EXPLORING AI TRACK DATABASE (40 COMPLETE EDUCATIONAL STEPS)
   ========================================================================== */

const exploringAIRoadmap = [
  {
    id: "EDU_001",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "None", Hindi: "कोई नहीं", Hinglish: "None" },
    title: {
      English: "What is AI?",
      Hindi: "AI क्या है?",
      Hinglish: "AI Kya Hai?"
    },
    summary: {
      English: "AI is a system that learns from examples to solve problems like a human child.",
      Hindi: "एआई एक स्मार्ट सिस्टम है जो बच्चे की तरह उदाहरणों से सीखकर काम करता है।",
      Hinglish: "AI ek smart system hai jo bache ki tarah examples se seekhkar kaam karta hai."
    },
    explanation: {
      English: "Artificial Intelligence (AI) means making computers smart. Instead of writing strict mathematical rules or codes, we train AI using data. It finds patterns in this data and makes its own decisions.",
      Hindi: "आर्टिफिशियल इंटेलिजेंस (AI) का मतलब है कंप्यूटर को समझदार बनाना। लंबे कोड लिखने के बजाय, हम AI को डेटा से सिखाते हैं। यह डेटा देखकर खुद फैसले लेता है।",
      Hinglish: "AI ka matlab hai computers ko dimaag dena. Isme coding ke strict rules likhne ke bajay, hum computer ko data dikhate hain aur wo data dekhkar khud patterns samajhta hai."
    },
    examples: {
      English: ["YouTube video suggestions", "ChatGPT chatbot", "Instagram explore feed"],
      Hindi: ["यूट्यूब वीडियो सिफारिशें", "चैटजीपीटी चैटबॉट", "इंस्टाग्राम एक्सप्लोर फीड"],
      Hinglish: ["YouTube recommendations", "ChatGPT answers", "Instagram explore page"]
    },
    keyConcepts: {
      English: ["Learning from data patterns", "No hardcoded code instructions", "Smart prediction of outcomes"],
      Hindi: ["डेटा पैटर्न से सीखना", "कोई हार्डकोडेड निर्देश नहीं", "स्मार्ट भविष्यवाणी करना"],
      Hinglish: ["Data se automatically seekhna", "Bina rules ke code run hona", "Outcome predict karna"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI is a living robot that will replace humans completely.",
        reality: "AI is just a powerful math calculator running software code."
      },
      Hindi: {
        myth: "एआई एक जिंदा रोबोट है जो इंसानों को पूरी तरह खत्म कर देगा।",
        reality: "एआई सिर्फ एक शक्तिशाली गणितीय कैलकुलेटर सॉफ्टवेयर है।"
      },
      Hinglish: {
        myth: "AI ek zinda dimaag hai jo sab par kabza kar lega.",
        reality: "AI ek computer math program hai jo sirf data patterns read karta hai."
      }
    },
    remember: {
      English: "AI learns from patterns, not manually written rules.",
      Hindi: "एआई नियमों से नहीं, बल्कि डेटा पैटर्न से सीखता है।",
      Hinglish: "AI pre-written code se nahi, data pattern se seekhta hai."
    },
    checkpoint: {
      question: {
        English: "How does AI learn to solve tasks?",
        Hindi: "एआई काम करना कैसे सीखता है?",
        Hinglish: "AI kaam karna kaise seekhta hai?"
      },
      options: {
        English: [
          "By learning patterns from data.",
          "By executing hardcoded rules.",
          "By thinking like a human mind.",
          "By searching Google in real-time."
        ],
        Hindi: [
          "डेटा से पैटर्न सीखकर।",
          "हार्डकोडेड नियमों को चलाकर।",
          "इंसानी दिमाग की तरह सोचकर।",
          "गूगल सर्च करके।"
        ],
        Hinglish: [
          "Data se patterns seekhkar.",
          "Strict codes follow karke.",
          "Sentient consciousness se.",
          "Google search load karke."
        ]
      },
      correct: 0,
      explanation: {
        English: "AI learns from dataset patterns instead of static programs.",
        Hindi: "एआई नियमों के बजाय डेटा पैटर्न से सीखता है।",
        Hinglish: "AI mathematical patterns aur training data se seekhta hai."
      }
    }
  },
  {
    id: "EDU_002",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "What is AI?", Hindi: "AI क्या है?", Hinglish: "What is AI?" },
    title: {
      English: "History of AI",
      Hindi: "एआई का इतिहास",
      Hinglish: "History of AI"
    },
    summary: {
      English: "AI started in 1956, went through funding dry spells (AI Winters), and boomed post-2012.",
      Hindi: "एआई की शुरुआत 1956 में हुई, फिर 'एआई विंटर्स' के ठहराव के बाद 2012 से तेजी आई।",
      Hinglish: "AI 1956 me shuru hua, loops me phase setbacks (AI Winters) aaye, aur 2012 me GPU boom mila."
    },
    explanation: {
      English: "AI was born at a Dartmouth conference in 1956. Early optimism faded because computers were slow, leading to 'AI Winters' (no funding). Modern AI took off after 2012 when powerful graphics cards (GPUs) allowed deep learning to finally scale.",
      Hindi: "1956 के डार्टमाउथ सम्मेलन में एआई की शुरुआत हुई। शुरुआती दौर में कंप्यूटर धीमे होने से काम रुक गया (AI Winters)। 2012 के बाद जीपीयू की ताकत से नया दौर शुरू हुआ।",
      Hinglish: "Dartmouth Project 1956 me official research shuru hui. Computation slow hone se funding ruk gayi jise 'AI Winter' bolte hain. 2012 ke baad modern GPUs aane se AI super fast ho gaya."
    },
    examples: {
      English: ["Deep Blue chess victory (1997)", "AlexNet image detection (2012)", "Siri launch (2011)"],
      Hindi: ["शतरंज में डीप ब्लू की जीत (1997)", "एलेक्सनेट इमेज डिटेक्शन (2012)", "सिरी की शुरुआत (2011)"],
      Hinglish: ["Deep Blue chess machine (1997)", "AlexNet neural model (2012)", "Siri launch (2011)"]
    },
    keyConcepts: {
      English: ["Alan Turing's Turing Test", "AI Winters (low budget eras)", "GPU-powered deep learning explosion"],
      Hindi: ["एलन ट्यूरिंग का ट्यूरिंग टेस्ट", "एआई विंटर्स (बजट की कमी)", "जीपीयू द्वारा संचालित डीप लर्निंग"],
      Hinglish: ["Turing Test parameters", "AI Winters funding crisis", "GPU hardware scaling boom"]
    },
    myth_vs_reality: {
      English: {
        myth: "Modern AI was invented just 2-3 years ago.",
        reality: "AI has a rich 70-year history of mathematical evolution."
      },
      Hindi: {
        myth: "एआई का आविष्कार 2-3 साल पहले हुआ था।",
        reality: "एआई का 70 साल पुराना गणितीय इतिहास है।"
      },
      Hinglish: {
        myth: "AI abhi 2-3 saal pehle sudden invent hua hai.",
        reality: "AI ka foundation 1950s me rakha gaya tha, ye 70 saal purani science hai."
      }
    },
    remember: {
      English: "Better hardware, not just new code, made modern AI possible.",
      Hindi: "बेहतर हार्डवेयर (जीपीयू) ने आधुनिक एआई को संभव बनाया।",
      Hinglish: "Sleek GPU hardware upgrade se modern AI boom aya."
    },
    checkpoint: {
      question: {
        English: "What was the main reason for AI Winters?",
        Hindi: "एआई विंटर्स का मुख्य कारण क्या था?",
        Hinglish: "AI Winters ka main reason kya tha?"
      },
      options: {
        English: [
          "Computers lacked storage and processing power.",
          "Governments banned AI globally.",
          "Algorithms were mathematically incorrect.",
          "Nobody was interested in smart machines."
        ],
        Hindi: [
          "कंप्यूटर में प्रोसेसिंग पावर और स्टोरेज की कमी थी।",
          "सरकारों ने एआई पर बैन लगा दिया था।",
          "गणितीय सिद्धांत गलत थे।",
          "किसी को एआई में रुचि नहीं थी।"
        ],
        Hinglish: [
          "Computers me compute/storage limit thi.",
          "Global governments ne ban lagaya.",
          "Math formulas galat the.",
          "Naye tools download nahi ho rahe the."
        ]
      },
      correct: 0,
      explanation: {
        English: "Old computers lacked the power to execute complex neural networks.",
        Hindi: "पुराने कंप्यूटर जटिल न्यूरल नेटवर्क चलाने में असमर्थ थे।",
        Hinglish: "Hardware limitations ke kaaran backpropagation perform karna impossible tha."
      }
    }
  },
  {
    id: "EDU_003",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "History of AI", Hindi: "एआई का इतिहास", Hinglish: "History of AI" },
    title: {
      English: "Evolution of AI",
      Hindi: "एआई का विकास",
      Hinglish: "Evolution of AI"
    },
    summary: {
      English: "AI evolved from manually-coded rules, to feature statistical systems, and now deep networks.",
      Hindi: "एआई नियम-आधारित कोडिंग से बढ़कर आज डीप न्यूरल नेटवर्क में बदल चुका है।",
      Hinglish: "AI rule-based (if-else) se ML, aur ab modern Deep Learning me evolve ho chuka hai."
    },
    explanation: {
      English: "AI has three evolutionary stages: 1) Rule-based (IF-THEN conditions typed by humans). 2) Classical Machine Learning (humans select features, model learns associations). 3) Deep Learning (neural networks read raw data and extract features automatically).",
      Hindi: "एआई के तीन चरण हैं: 1) नियम-आधारित (मैन्युअल IF-THEN कोडिंग)। 2) क्लासिक मशीन लर्निंग (इंसान फीचर्स बताते हैं और मॉडल सीखता है)। 3) डीप लर्निंग (सिस्टम खुद डेटा से सीखता है)।",
      Hinglish: "AI ke 3 eras hain: 1) Rule-based (Handwritten conditions). 2) Classical ML (Manual features mapping). 3) Deep Learning (Neural nets auto-extract details)."
    },
    examples: {
      English: ["Tax calculators (Rule-based)", "Email spam filter (Classical ML)", "ChatGPT text generation (Deep Learning)"],
      Hindi: ["टैक्स कैलकुलेटर (नियम-आधारित)", "स्पैम फिल्टर (क्लासिक एमएल)", "चैटजीपीटी टेक्स्ट जेनरेशन (डीप लर्निंग)"],
      Hinglish: ["Simple form checks (Rule)", "Housing price prediction (Classical ML)", "ChatGPT response (Deep Learning)"]
    },
    keyConcepts: {
      English: ["Rule sheets limitations", "Feature engineering checks", "Representation auto-learning"],
      Hindi: ["नियम पत्रक की सीमाएं", "फ़ीचर इंजीनियरिंग का काम", "स्वचालित प्रतिनिधित्व सीखना"],
      Hinglish: ["Rule list limit", "Manual feature extraction", "Neural net auto features mapping"]
    },
    myth_vs_reality: {
      English: {
        myth: "Deep Learning has completely replaced all older programming.",
        reality: "Rule-based checks and classical ML are still widely used for simple calculations."
      },
      Hindi: {
        myth: "डीप लर्निंग ने पुराने सभी प्रोग्रामों को खत्म कर दिया है।",
        reality: "साधारण गणनाओं के लिए नियम-आधारित प्रोग्राम आज भी उपयोगी हैं।"
      },
      Hinglish: {
        myth: "Deep Learning ne purani sab programming finish kar di.",
        reality: "Simple math ya logic checks ke liye rules aur ML abhi bhi fast option hain."
      }
    },
    remember: {
      English: "Deep learning finds its own features; classical ML needs human help.",
      Hindi: "डीप लर्निंग खुद फीचर्स ढूंढता है, क्लासिक एमएल को इंसानी मदद चाहिए।",
      Hinglish: "Deep learning auto-features extract karta hai, human input bypass karke."
    },
    checkpoint: {
      question: {
        English: "What makes Deep Learning unique compared to Classical ML?",
        Hindi: "क्लासिक एमएल की तुलना में डीप लर्निंग को क्या अनोखा बनाता है?",
        Hinglish: "Deep Learning Classical ML se kaise unique hai?"
      },
      options: {
        English: [
          "It extracts features automatically from raw data.",
          "It uses simple IF-THEN rules.",
          "It does not require computational hardware.",
          "It is completely deterministic."
        ],
        Hindi: [
          "यह कच्चे डेटा से स्वचालित रूप से फीचर्स निकालता है।",
          "यह सरल IF-THEN नियमों का उपयोग करता है।",
          "इसे किसी हार्डवेयर की आवश्यकता नहीं है।",
          "यह पूरी तरह से नियतात्मक है।"
        ],
        Hinglish: [
          "Yeh raw data se features automatically learn karta hai.",
          "Yeh simple if-else sheets use karta hai.",
          "Isme processor use nahi hota.",
          "Yeh 100% pre-coded inputs return karta hai."
        ]
      },
      correct: 0,
      explanation: {
        English: "Deep learning networks bypass manual feature engineering by learning features directly.",
        Hindi: "डीप लर्निंग सीधे कच्चे डेटा से फीचर्स निकालना सीखता है।",
        Hinglish: "Multi-layer networks data patterns ko direct variables me map kar lete hain."
      }
    }
  },
  {
    id: "EDU_004",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Evolution of AI", Hindi: "एआई का विकास", Hinglish: "Evolution of AI" },
    title: {
      English: "How AI Actually Works",
      Hindi: "एआई कैसे काम करता है?",
      Hinglish: "AI Kaise Kaam Karta Hai?"
    },
    summary: {
      English: "AI finds math patterns in data and assigns weights to calculate the best output.",
      Hindi: "एआई डेटा में गणितीय पैटर्न ढूंढता है और सर्वश्रेष्ठ आउटपुट की गणना करता है।",
      Hinglish: "AI inputs ko numbers me badalta hai, weights adjust karta hai, aur output guess karta hai."
    },
    explanation: {
      English: "AI systems don't understand things like humans do. They convert images, text, or sounds into numbers (vectors). Then, they run these numbers through mathematical formulas using 'weights' (importance scores) to predict the most likely answer.",
      Hindi: "एआई इंसानों की तरह सोचता नहीं है। यह चित्रों, शब्दों और ध्वनियों को संख्याओं (वेक्टर्स) में बदलता है। फिर गणितीय सूत्रों के माध्यम से सबसे सटीक उत्तर की भविष्यवाणी करता है।",
      Hinglish: "AI objects ko numbers (vectors) me translate karta hai. In numbers ko dynamic equations me weights se multiply karke output predictions guess kiye jaate hain."
    },
    examples: {
      English: ["Google Translate converting language vectors", "Camera apps detecting face shapes", "Spotify queue prediction"],
      Hindi: ["भाषा वेक्टर्स का अनुवाद करता गूगल अनुवाद", "चेहरे की पहचान करते कैमरा ऐप्स", "स्पॉटिफ़ाई ऑटो-प्ले क्यू"],
      Hinglish: ["Google Translate vectors mapping", "Camera face unlock mapping points", "Spotify auto-play predictions"]
    },
    keyConcepts: {
      English: ["Vector representation of data", "Parameters and neural weights", "Training via backpropagation error"],
      Hindi: ["डेटा का वेक्टर प्रतिनिधित्व", "पैरामीटर और न्यूरल वेट्स", "बैकप्रोपैगेशन द्वारा प्रशिक्षण"],
      Hinglish: ["Data into vectors conversions", "Mathematical weights/biases", "Backpropagation feedback adjustments"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI understands the meaning of words it writes.",
        reality: "AI only calculates the statistical probability of which word should come next."
      },
      Hindi: {
        myth: "एआई जो लिखता है, उसका अर्थ खुद समझता है।",
        reality: "एआई केवल गणितीय संभावना की गणना करता है कि अगला शब्द क्या होना चाहिए।"
      },
      Hinglish: {
        myth: "AI text ka actual meaning feel karta hai.",
        reality: "AI sirf mathematical patterns dekhkar agla word predict karta hai."
      }
    },
    remember: {
      English: "AI is advanced math, geometry, and probability, not conscious thinking.",
      Hindi: "एआई केवल उन्नत गणित और संभाव्यता है, सचेत सोच नहीं।",
      Hinglish: "AI calculation and probability hai, dimaag ya consciousness nahi."
    },
    checkpoint: {
      question: {
        English: "What does AI convert text and images into before processing?",
        Hindi: "प्रसंस्करण से पहले एआई टेक्स्ट और छवियों को किसमें बदलता है?",
        Hinglish: "Processing se pehle AI inputs ko kisme convert karta hai?"
      },
      options: {
        English: [
          "Numbers (vectors).",
          "English paragraphs.",
          "Binary code sheets.",
          "Web search urls."
        ],
        Hindi: [
          "संख्याओं (वेक्टर्स) में।",
          "अंग्रेजी पैराग्राफ में।",
          "बाइनरी कोड शीट में।",
          "वेब सर्च यूआरएल में।"
        ],
        Hinglish: [
          "Numbers (vectors) me.",
          "English characters me.",
          "Zip file package folders me.",
          "Google search query strings me."
        ]
      },
      correct: 0,
      explanation: {
        English: "All inputs are mapped as numeric vectors in high-dimensional space.",
        Hindi: "सभी इनपुट को गणितीय विश्लेषण के लिए संख्यात्मक वेक्टर्स में बदला जाता है।",
        Hinglish: "AI maths perform karne ke liye har format ko numbers (vectors) me badalta hai."
      }
    }
  },
  {
    id: "EDU_005",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "How AI Actually Works", Hindi: "एआई कैसे काम करता है?", Hinglish: "How AI Actually Works" },
    title: {
      English: "How LLMs Work",
      Hindi: "एलएलएम (LLMs) कैसे काम करते हैं?",
      Hinglish: "LLMs Kaise Kaam Karte Hain?"
    },
    summary: {
      English: "LLMs predict the next word in a sentence by looking at massive internet datasets.",
      Hindi: "एलएलएम इंटरनेट डेटासेट के आधार पर किसी वाक्य में अगले शब्द की भविष्यवाणी करते हैं।",
      Hinglish: "LLMs pure internet ke text ko scan karke ek sentence me next word predict karte hain."
    },
    explanation: {
      English: "Large Language Models (LLMs) are autocomplete systems on steroids. They are trained on billions of pages of internet text. They read a prompt, analyze the words, and calculate the mathematical probability of what the very next word should be.",
      Hindi: "लार्ज लैंग्वेज मॉडल (LLM) बहुत शक्तिशाली ऑटो-कम्पलीट सिस्टम हैं। इन्हें इंटरनेट की अरबों फाइलों पर प्रशिक्षित किया जाता है। वे आपके प्रॉम्प्ट को पढ़कर अगले सबसे संभावित शब्द को जोड़ते हैं।",
      Hinglish: "LLMs super-advanced autocomplete tools hain. Inhe massive internet text par train kiya jata hai. Ye aapke text ko padh kar agla logical word guess karte hain."
    },
    examples: {
      English: ["ChatGPT auto-completing paragraphs", "Gmail smart compose text", "Github Copilot code suggestions"],
      Hindi: ["चैटजीपीटी पैराग्राफ स्वतः पूर्ण करना", "जीमेल स्मार्ट कंपोज़", "गिटहब कोपायलट कोड सुझाव"],
      Hinglish: ["ChatGPT text generation", "Gmail automatic autocomplete text", "Mobile keyboard next-word prediction"]
    },
    keyConcepts: {
      English: ["Next token prediction", "Transformer neural architecture", "Tokenization splits"],
      Hindi: ["अगला टोकन अनुमान लगाना", "ट्रांसफॉर्मर न्यूरल आर्किटेक्चर", "टोकनाइजेशन"],
      Hinglish: ["Next token prediction parameters", "Transformer attention blocks", "Text strings ko tokens me split karna"]
    },
    myth_vs_reality: {
      English: {
        myth: "LLMs access database search links for every single answer.",
        reality: "LLMs generate words on the fly based on internal network connections, not search copy-paste."
      },
      Hindi: {
        myth: "एलएलएम हर जवाब के लिए डेटाबेस सर्च लिंक्स खोलते हैं।",
        reality: "एलएलएम आंतरिक नेटवर्किंग संभावनाओं के आधार पर खुद जवाब रचते हैं।"
      },
      Hinglish: {
        myth: "LLMs direct Google search karke text copy paste karte hain.",
        reality: "LLMs internal neuron weights se on-the-fly naya word build karte hain."
      }
    },
    remember: {
      English: "LLMs are statistical word-completion calculators, not fact-checkers.",
      Hindi: "एलएलएम केवल शब्द-संभाव्यता की गणना करते हैं, ये तथ्य-जांचकर्ता नहीं हैं।",
      Hinglish: "LLMs statistical word predictors hain, factual knowledge databases nahi."
    },
    checkpoint: {
      question: {
        English: "What is the core target of an LLM during text generation?",
        Hindi: "टेक्स्ट जनरेशन के दौरान एलएलएम का मुख्य लक्ष्य क्या होता है?",
        Hinglish: "Text generation ke time LLM ka primary focus kya hota hai?"
      },
      options: {
        English: [
          "To predict the next token (word fragment).",
          "To copy content from Wikipedia.",
          "To check if the user is lying.",
          "To write a python compiler program."
        ],
        Hindi: [
          "अगले टोकन (शब्द अंश) की भविष्यवाणी करना।",
          "विकिपीडिया से सामग्री कॉपी करना।",
          "जांचना कि क्या उपयोगकर्ता झूठ बोल रहा है।",
          "पायथन कंपाइलर प्रोग्राम लिखना।"
        ],
        Hinglish: [
          "Next token/word predict karna.",
          "Wikipedia site search copy karna.",
          "User ideas match check rules verify karna.",
          "Online connection port update karna."
        ]
      },
      correct: 0,
      explanation: {
        English: "LLMs generate texts step-by-step by selecting the highest probability next token.",
        Hindi: "एलएलएम अगले सबसे संभावित शब्द के टुकड़े की भविष्यवाणी करके पाठ उत्पन्न करते हैं।",
        Hinglish: "Models prompt variables ko process karke next token select/generate karte hain."
      }
    }
  },
  {
    id: "EDU_006",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "How LLMs Work", Hindi: "एलएलएम कैसे काम करते हैं?", Hinglish: "How LLMs Work" },
    title: {
      English: "Machine Learning",
      Hindi: "मशीन लर्निंग (Machine Learning)",
      Hinglish: "Machine Learning"
    },
    summary: {
      English: "ML is computers finding equations and formulas from data instead of hardcoding.",
      Hindi: "मशीन लर्निंग का मतलब है डेटा से पैटर्न सीखकर काम करना, न कि निर्देश लिखना।",
      Hinglish: "ML me computers coding ke bajay data se rules khud seekhte hain."
    },
    explanation: {
      English: "In traditional coding, programmers write rules to process data. In Machine Learning, we give the computer data and the final outputs, and the computer finds the logical rules and formulas automatically.",
      Hindi: "पारंपरिक कोडिंग में हम नियम लिखते हैं। मशीन लर्निंग में हम कंप्यूटर को केवल इनपुट डेटा और परिणाम देते हैं, और कंप्यूटर खुद उन नियमों का पता लगाता है।",
      Hinglish: "Traditional coding me hum rules write karte hain. Machine learning me hum input aur target output dono machine ko de dete hain, aur machine khud mathematical rule (formula) design karti hai."
    },
    examples: {
      English: ["Real estate price predictions", "Email classification rules", "E-commerce purchase forecasts"],
      Hindi: ["घर की कीमत की भविष्यवाणी", "ईमेल स्पैम वर्गीकरण", "उत्पाद खरीद पूर्वानुमान"],
      Hinglish: ["House price forecast model", "Spam classifier checks", "Amazon buy predictions"]
    },
    keyConcepts: {
      English: ["Supervised (labeled) training data", "Features and target labels", "Mathematical regression models"],
      Hindi: ["सुपरवाइज़्ड प्रशिक्षण डेटा", "फ़ीचर और टारगेट लेबल", "गणितीय रिग्रेशन मॉडल"],
      Hinglish: ["Labeled training dataset", "Input features vs targets", "Regression & classification models"]
    },
    myth_vs_reality: {
      English: {
        myth: "Machine Learning is magic that works on any random data.",
        reality: "ML only works if the training data is clean, formatted, and logically structured."
      },
      Hindi: {
        myth: "मशीन लर्निंग जादू है जो किसी भी डेटा पर चल जाता है।",
        reality: "मशीन लर्निंग तभी काम करता है जब डेटा साफ़, सटीक और व्यवस्थित हो।"
      },
      Hinglish: {
        myth: "ML ek magic hai jo kisi bhi raw/garbage file par work karega.",
        reality: "ML models ko train hone ke liye clean aur structured numerical data chahiye."
      }
    },
    remember: {
      English: "Rules are written in coding; rules are learned in Machine Learning.",
      Hindi: "पारंपरिक कोडिंग नियम लिखती है; मशीन लर्निंग नियम सीखती है।",
      Hinglish: "Coding me rules manually likhte hain, ML me rules computer khud build karta hai."
    },
    checkpoint: {
      question: {
        English: "What represents Supervised Machine Learning?",
        Hindi: "सुपरवाइज़्ड मशीन लर्निंग क्या दर्शाता है?",
        Hinglish: "Supervised Machine Learning ka matlab kya hai?"
      },
      options: {
        English: [
          "Training models using labeled datasets with correct answers.",
          "Writing infinite nested IF-ELSE loops.",
          "Shutting down servers manually when bugs appear.",
          "Connecting standard database search engines."
        ],
        Hindi: [
          "सही उत्तरों वाले लेबल किए गए डेटासेट का उपयोग करके मॉडल को प्रशिक्षित करना।",
          "अनंत नेस्टेड IF-ELSE लूप लिखना।",
          "बग आने पर सर्वर बंद करना।",
          "डेटाबेस सर्च इंजन को जोड़ना।"
        ],
        Hinglish: [
          "Labeled data (input + correct output) se train karna.",
          "If-else instructions manually code karna.",
          "Offline mode me compiler files run karna.",
          "Internet bandwidth increase karna."
        ]
      },
      correct: 0,
      explanation: {
        English: "Supervised models learn mapping from features to tags using historical correct inputs.",
        Hindi: "सुपरवाइज़्ड मॉडल सही उत्तरों की मदद से इनपुट और आउटपुट का संबंध सीखते हैं।",
        Hinglish: "Correct target values check karke weights adjust karna supervised modeling hai."
      }
    }
  },
  {
    id: "EDU_007",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Machine Learning", Hindi: "मशीन लर्निंग", Hinglish: "Machine Learning" },
    title: {
      English: "Deep Learning",
      Hindi: "डीप लर्निंग (Deep Learning)",
      Hinglish: "Deep Learning"
    },
    summary: {
      English: "Deep Learning uses multi-layered networks to process raw text, images, and video automatically.",
      Hindi: "डीप लर्निंग गहरे न्यूरल नेटवर्क का उपयोग करके कच्चे डेटा को अपने आप संसाधित करता है।",
      Hinglish: "Deep Learning layered networks use karta hai bina manually features banaye raw files read karne ke liye."
    },
    explanation: {
      English: "Deep Learning is a specialized sub-branch of Machine Learning. It uses deep networks (neural networks with many layers). While classical ML needs humans to extract features (like cat ears or color), Deep Learning learns features directly from raw pixels or text.",
      Hindi: "डीप लर्निंग मशीन लर्निंग का एक उन्नत हिस्सा है। यह कई परतों वाले न्यूरल नेटवर्क का उपयोग करता है। जहां क्लासिक एमएल को इंसानी इनपुट चाहिए, वहीं डीप लर्निंग सीधे चित्रों या शब्दों से पैटर्न सीख लेता है।",
      Hinglish: "Deep learning ML ka advanced subset hai jo brain-like layers (neural nets) use karta hai. Isme raw data (photos/videos) direct model me daale jaate hain aur system automatically features detect karta hai."
    },
    examples: {
      English: ["Self-driving cars detecting signs", "Facial recognition cameras", "Generative AI like Midjourney"],
      Hindi: ["सड़क संकेत पहचानती कारें", "चेहरे की पहचान करने वाले कैमरे", "मिडजर्नी जैसी एआई कलाकृतियां"],
      Hinglish: ["Autonomous car object check", "Face ID photo scan", "Midjourney image generation"]
    },
    keyConcepts: {
      English: ["Deep multi-layer neural networks", "Automatic feature extraction", "GPU computation scales"],
      Hindi: ["गहरी बहु-परत न्यूरल नेटवर्क", "स्वचालित सुविधा निष्कर्षण", "जीपीयू कंप्यूटेशन स्केलिंग"],
      Hinglish: ["Multi-layer connections networks", "Auto representation learn", "GPU scale compute power"]
    },
    myth_vs_reality: {
      English: {
        myth: "Deep Learning works perfectly with very little training data.",
        reality: "Deep learning models require millions of examples to make accurate predictions."
      },
      Hindi: {
        myth: "डीप लर्निंग बहुत कम डेटा के साथ भी बेहतरीन काम करता है।",
        reality: "डीप लर्निंग मॉडल को सटीक भविष्यवाणी करने के लिए लाखों उदाहरणों की आवश्यकता होती है।"
      },
      Hinglish: {
        myth: "Deep Learning bina data ke bohot jaldi train ho jata hai.",
        reality: "Isse accuracy ke liye massive datasets aur scale numbers data files chahiye."
      }
    },
    remember: {
      English: "Deep learning removes the need for manual feature selection.",
      Hindi: "डीप लर्निंग स्वचालित रूप से फीचर्स चुनता है, इंसानी मदद के बिना।",
      Hinglish: "Deep learning feature engineering ka human effort bypass kar deta hai."
    },
    checkpoint: {
      question: {
        English: "What is the primary advantage of Deep Learning over Classical ML?",
        Hindi: "क्लासिक एमएल की तुलना में डीप लर्निंग का मुख्य लाभ क्या है?",
        Hinglish: "Deep learning ka Classical ML par main advantage kya hai?"
      },
      options: {
        English: [
          "It extracts features automatically from raw unstructured data.",
          "It uses simpler mathematical calculations.",
          "It runs extremely fast on older single-core CPUs.",
          "It does not require any dataset to learn."
        ],
        Hindi: [
          "यह कच्चे असंरचित डेटा से स्वचालित रूप से फीचर्स निकालता है।",
          "यह सरल गणितीय गणनाओं का उपयोग करता है।",
          "यह पुराने सिंगल-कोर सीपीयू पर बहुत तेजी से चलता है।",
          "इसे सीखने के लिए किसी डेटासेट की आवश्यकता नहीं है।"
        ],
        Hinglish: [
          "Yeh raw data se features automatically learn karta hai.",
          "Yeh simple maths compute karti hai.",
          "Yeh single-core slow system par speed run hoti hai.",
          "Isme background memory index empty chahiye."
        ]
      },
      correct: 0,
      explanation: {
        English: "Deep learning extracts patterns from unstructured data (images, sound) without human step limits.",
        Hindi: "डीप लर्निंग बिना मानवीय हस्तक्षेप के असंरचित डेटा (छवियों, ध्वनियों) से पैटर्न सीखता है।",
        Hinglish: "Automatic feature learning hi deep neural layers ka main benefit hai."
      }
    }
  },
  {
    id: "EDU_008",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Deep Learning", Hindi: "डीप लर्निंग", Hinglish: "Deep Learning" },
    title: {
      English: "Neural Networks",
      Hindi: "न्यूरल नेटवर्क (Neural Networks)",
      Hinglish: "Neural Networks"
    },
    summary: {
      English: "Neural Networks are math layers inspired by human brain connections.",
      Hindi: "न्यूरल नेटवर्क इंसानी दिमाग के न्यूरॉन्स से प्रेरित गणितीय परतें हैं।",
      Hinglish: "Neural networks dimaag ke connections se inspired math equations ki layers hain."
    },
    explanation: {
      English: "Neural Networks are inspired by the human brain. They consist of layers of simulated 'neurons' (nodes). When data enters the input layer, neurons multiply it by weights and pass it to the hidden layers. The output layer then prints the final prediction.",
      Hindi: "न्यूरल नेटवर्क इंसानी दिमाग की कार्यप्रणाली से प्रेरित हैं। इसमें गणितीय 'न्यूरॉन्स' (नोड्स) की परतें होती हैं। इनपुट परत डेटा लेकर उसे प्रोसेस करती है और आउटपुट परत अंतिम नतीजा देती है।",
      Hinglish: "Neural nets human brain se inspired programming structures hain. Isme nodes (neurons) coordinate layers me hote hain: input layer parameters leti hai, hidden layers calculation karti hain aur output layer target show karti hai."
    },
    examples: {
      English: ["Photo editing tools detecting edges", "Voice tools translating sound frequencies", "Handwriting recognition software"],
      Hindi: ["किनारों को पहचानते फोटो एडिटिंग ऐप्स", "ध्वनि को शब्दों में बदलते वॉयस टूल्स", "हस्तलेखन पहचान सॉफ्टवेयर"],
      Hinglish: ["Photo filters detecting edges", "Voice note to text convert", "Handwritten check scan systems"]
    },
    keyConcepts: {
      English: ["Input, Hidden, and Output layers", "Neuron activation functions (Sigmoid/ReLU)", "Loss minimization calculations"],
      Hindi: ["इनपुट, हिडन और आउटपुट परतें", "सक्रियण फ़ंक्शन (Activation functions)", "नुकसान कम करने की गणना"],
      Hinglish: ["Input, Hidden, Output node layers", "Activation functions (Sigmoid/ReLU)", "Loss function adjustments error"]
    },
    myth_vs_reality: {
      English: {
        myth: "Neural networks are exact simulations of a biological brain.",
        reality: "They are only crude mathematical approximations of simplified brain structures."
      },
      Hindi: {
        myth: "न्यूरल नेटवर्क जैविक दिमाग की बिल्कुल सटीक नकल हैं।",
        reality: "वे केवल सरलीकृत दिमाग की संरचनाओं के गणितीय अनुमान हैं।"
      },
      Hinglish: {
        myth: "Neural network biological brain ki exact duplicate copy hain.",
        reality: "Yeh sirf statistics aur algebraic matrices multiplication formulas hain."
      }
    },
    remember: {
      English: "Neural networks are matrices of numbers adjusting themselves to reduce errors.",
      Hindi: "न्यूरल नेटवर्क केवल संख्याओं के मैट्रिक्स हैं जो त्रुटियों को कम करने के लिए खुद को बदलते हैं।",
      Hinglish: "Neural nets matrix arrays hain jo error output reduce karne ke liye update hote hain."
    },
    checkpoint: {
      question: {
        English: "What are the three main types of layers in a neural network?",
        Hindi: "न्यूरल नेटवर्क में तीन मुख्य प्रकार की परतें कौन सी हैं?",
        Hinglish: "Neural network ki 3 main layers kaun si hain?"
      },
      options: {
        English: [
          "Input layer, Hidden layer, and Output layer.",
          "Hardware layer, Software layer, and Internet layer.",
          "Code layer, Graphic layer, and Storage layer.",
          "Static layer, Random layer, and User layer."
        ],
        Hindi: [
          "इनपुट परत, हिडन परत और आउटपुट परत।",
          "हार्डवेयर परत, सॉफ्टवेयर परत और इंटरनेट परत।",
          "कोड परत, ग्राफिक परत और स्टोरेज परत।",
          "स्थिर परत, यादृच्छिक परत और उपयोगकर्ता परत।"
        ],
        Hinglish: [
          "Input layer, Hidden layer, Output layer.",
          "System layer, Application layer, Net layer.",
          "Data storage, Server links, Web layout.",
          "Random seeds, CSS styles, variables."
        ]
      },
      correct: 0,
      explanation: {
        English: "A neural network processes data starting at inputs, computes in hidden nodes, and returns via output layers.",
        Hindi: "डेटा इनपुट से प्रवेश करता है, हिडन परत में प्रोसेस होता है, और आउटपुट परत के माध्यम से परिणाम देता है।",
        Hinglish: "Dada nodes calculations inputs layer se output nodes coordinates map karte hain."
      }
    }
  },
  {
    id: "EDU_009",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Neural Networks", Hindi: "न्यूरल नेटवर्क", Hinglish: "Neural Networks" },
    title: {
      English: "How ChatGPT Works",
      Hindi: "चैटजीपीटी कैसे काम करता है?",
      Hinglish: "ChatGPT Kaise Kaam Karta Hai?"
    },
    summary: {
      English: "ChatGPT uses a GPT model trained in two stages: pre-training and human feedback tuning.",
      Hindi: "चैटजीपीटी दो चरणों (प्री-ट्रेनिंग और इंसानी फीडबैक) में प्रशिक्षित एक भाषा मॉडल का उपयोग करता है।",
      Hinglish: "ChatGPT massive reading (Pre-training) aur human feedback mapping (RLHF) se behave karta hai."
    },
    explanation: {
      English: "ChatGPT has two learning steps: 1) Pre-training (it reads the internet to learn words, grammar, and facts). 2) Reinforcement Learning from Human Feedback or RLHF (human trainers rate its answers, teaching it to be polite, helpful, and safe).",
      Hindi: "चैटजीपीटी दो चरणों में सीखता है: 1) प्री-ट्रेनिंग (यह इंटरनेट पढ़कर भाषा सीखता है)। 2) इंसानी फीडबैक से प्रशिक्षण (RLHF - जहां ट्रेनर इसे मददगार, विनम्र और सुरक्षित उत्तर देना सिखाते हैं)।",
      Hinglish: "ChatGPT ke 2 main phases hain: 1) Pre-training (Pure internet books read karke syntax seekhna). 2) RLHF (Human feedback checks se toxic responses filter karna aur chat-like answers banana)."
    },
    examples: {
      English: ["Explaining complex math in simple words", "Writing code blocks from prompt directives", "Translating files safely"],
      Hindi: ["गणित के कठिन सवालों को आसानी से समझाना", "प्रॉम्प्ट से कोड लिखना", "फाइलों का सुरक्षित अनुवाद करना"],
      Hinglish: ["Homework explanations help", "Code scripts write prompts", "Language convert files safely"]
    },
    keyConcepts: {
      English: ["Generative Pre-trained Transformer (GPT)", "RLHF alignment rules", "Safety guardrail filters"],
      Hindi: ["जेनरेटिव प्री-ट्रेन्ड ट्रांसफार्मर", "आरएलएचएफ (RLHF) नियम", "सुरक्षा गार्डरेल"],
      Hinglish: ["GPT structure", "RLHF feedback tuning", "Safety systems templates"]
    },
    myth_vs_reality: {
      English: {
        myth: "ChatGPT is super smart and knows everything about your personal life.",
        reality: "ChatGPT does not know you; it has no feelings and only generates text based on patterns."
      },
      Hindi: {
        myth: "चैटजीपीटी बहुत बुद्धिमान है और आपकी निजी जिंदगी के बारे में सब जानता है।",
        reality: "चैटजीपीटी आपको नहीं जानता; इसके पास भावनाएं नहीं हैं, यह सिर्फ शब्द जोड़ता है।"
      },
      Hinglish: {
        myth: "ChatGPT intelligent insaan hai jo sab memory save rakhta hai.",
        reality: "ChatGPT ek statistical software framework hai jo custom prompt keywords select karta hai."
      }
    },
    remember: {
      English: "ChatGPT does not think; it calculates the next most logical word.",
      Hindi: "चैटजीपीटी सोचता नहीं है, यह सिर्फ अगले तार्किक शब्द की गणना करता है।",
      Hinglish: "ChatGPT ke pass emotions nahi hain, wo sirf calculations map karta hai."
    },
    checkpoint: {
      question: {
        English: "What is RLHF in ChatGPT training?",
        Hindi: "चैटजीपीटी प्रशिक्षण में आरएलएचएफ (RLHF) क्या है?",
        Hinglish: "ChatGPT training me RLHF kya hota hai?"
      },
      options: {
        English: [
          "Tuning the model using human ratings and preferences.",
          "Running the model without electricity.",
          "Translating inputs into raw binary formats.",
          "Directly accessing offline document folders."
        ],
        Hindi: [
          "मानव रेटिंग और प्राथमिकताओं का उपयोग करके मॉडल को ठीक करना।",
          "बिना बिजली के मॉडल चलाना।",
          "इनपुट को बाइनरी प्रारूपों में अनुवाद करना।",
          "दस्तावेज़ फ़ोल्डरों को सीधे एक्सेस करना।"
        ],
        Hinglish: [
          "Human feedback reviews se output align train karna.",
          "Hard drive memory clean reset program run karna.",
          "System hardware performance benchmark scale test.",
          "Web link search indexing files database update."
        ]
      },
      correct: 0,
      explanation: {
        English: "RLHF aligns the raw model to match human preferences, safety, and conversation rules.",
        Hindi: "आरएलएचएफ मॉडल को इंसानों के लिए उपयोगी और सुरक्षित बनाने में मदद करता है।",
        Hinglish: "Human review process model ko safe and friendly output rules sikhata hai."
      }
    }
  },
  {
    id: "EDU_010",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "How ChatGPT Works", Hindi: "चैटजीपीटी कैसे काम करता है?", Hinglish: "How ChatGPT Works" },
    title: {
      English: "How Gemini Works",
      Hindi: "जेमिनी कैसे काम करता है?",
      Hinglish: "Gemini Kaise Kaam Karta Hai?"
    },
    summary: {
      English: "Gemini was built native multimodal, meaning it understands text, images, and audio natively.",
      Hindi: "जेमिनी को शुरुआत से ही मल्टीमॉडल बनाया गया है, जो टेक्स्ट, इमेज और ऑडियो को एक साथ समझता है।",
      Hinglish: "Gemini starting se multimodal hai jo ek sath text, video, photo aur voice coordinate kar sakta hai."
    },
    explanation: {
      English: "Unlike older AI models that were built only for text, Google Gemini was built 'multimodal' from day one. It processes text, images, audio, video, and code in a single neural model, allowing it to reason across different inputs seamlessly.",
      Hindi: "अन्य मॉडलों के विपरीत, गूगल जेमिनी को शुरुआत से ही 'मल्टीमॉडल' बनाया गया है। यह एक ही समय में टेक्स्ट, इमेज, ऑडियो, वीडियो और कोड को एक साथ समझने की क्षमता रखता है।",
      Hinglish: "Purane systems sirf text read karte the. Google Gemini starting se native 'multimodal' hai. Yeh text, audio, images, aur coding values ko bina extra conversions ke directly link process kar sakta hai."
    },
    examples: {
      English: ["Analyzing a handwritten math photo and explaining it", "Creating code files from a video preview", "Translating spoke audio directly to text"],
      Hindi: ["लिखे हुए गणित के सवाल की फोटो देखकर समझाना", "वीडियो प्रीव्यू से कोडिंग फाइल्स बनाना", "बोली गई आवाज का सीधे अनुवाद करना"],
      Hinglish: ["Handwritten math image solve scan", "Video preview se script draft generation", "Audio note directly context verify map"]
    },
    keyConcepts: {
      English: ["Native Multimodality design", "Cross-attention inputs layers", "Large context windows limits"],
      Hindi: ["मूल मल्टीमॉडल डिजाइन", "क्रॉस-अटेंशन इनपुट परतें", "विशाल संदर्भ विंडो सीमाएं"],
      Hinglish: ["Native Multimodal architecture", "Joint representations layers", "Huge context file sizes handles"]
    },
    myth_vs_reality: {
      English: {
        myth: "Gemini converts images to text description before reading them.",
        reality: "Gemini processes images directly in their raw visual format alongside text tokens."
      },
      Hindi: {
        myth: "जेमिनी छवियों को पढ़ने से पहले उन्हें टेक्स्ट में बदलता है।",
        reality: "जेमिनी सीधे छवियों को उनके मूल दृश्य प्रारूप में प्रोसेस करता है।"
      },
      Hinglish: {
        myth: "Gemini pehle photo ko text me change karke read karta hai.",
        reality: "Gemini directly photo grids pixels ko input representations me parse karta hai."
      }
    },
    remember: {
      English: "Gemini is a single system built to read text, visual, and audio files at once.",
      Hindi: "जेमिनी एक ही समय में टेक्स्ट, विजुअल और ऑडियो फाइलों को एक साथ समझने वाला एकीकृत मॉडल है।",
      Hinglish: "Gemini single model hai jo multiple visual-audio signals ek sath run karta hai."
    },
    checkpoint: {
      question: {
        English: "What does 'multimodal' mean for Google Gemini?",
        Hindi: "गूगल जेमिनी के संदर्भ में 'मल्टीमॉडल' का क्या अर्थ है?",
        Hinglish: "Gemini me Multimodal word ka meaning kya hai?"
      },
      options: {
        English: [
          "It processes text, images, and audio inside a single system.",
          "It only works on multiple monitors.",
          "It uses multiple processors without software.",
          "It requires translation to binary rules."
        ],
        Hindi: [
          "यह एक ही प्रणाली में टेक्स्ट, छवियों और ऑडियो को प्रोसेस करता है।",
          "यह केवल कई मॉनीटरों पर काम करता है।",
          "यह बिना सॉफ्टवेयर के कई प्रोसेसर का उपयोग करता है।",
          "इसके लिए बाइनरी नियमों में अनुवाद की आवश्यकता होती है।"
        ],
        Hinglish: [
          "Yeh ek sath text, visual frames aur voice parse kar sakta hai.",
          "Isme multiple systems offline sync files required.",
          "Yeh static code output return text limit handles.",
          "Isme custom database limits block settings."
        ]
      },
      correct: 0,
      explanation: {
        English: "Multimodal systems share representational layers for words, sound waves, and pixels.",
        Hindi: "मल्टीमॉडल प्रणालियां छवियों, ध्वनि तरंगों और शब्दों को एक साथ समझने में सक्षम होती हैं।",
        Hinglish: "Multi-inputs coordinates mapping hi native multimodality ka definition hai."
      }
    }
  },
  {
    id: "EDU_011",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "How Gemini Works", Hindi: "जेमिनी कैसे काम करता है?", Hinglish: "How Gemini Works" },
    title: {
      English: "Image Generation",
      Hindi: "छवि निर्माण (Image Generation)",
      Hinglish: "Image Generation"
    },
    summary: {
      English: "Image generators use diffusion models that clear out noise from random static to build images.",
      Hindi: "इमेज जेनरेशन मॉडल शोर (Noise) को साफ करके धुंधली छवियों से साफ तस्वीरें बनाते हैं।",
      Hinglish: "Image models random static pixels (noise) se step-by-step clean visual image build karte hain."
    },
    explanation: {
      English: "AI image makers like Midjourney or Stable Diffusion use 'Diffusion Models'. They start with a completely random pixel block (like television static). Guided by your prompt, the model runs step-by-step 'denoising' loops, clearing the static until a sharp image appears.",
      Hindi: "मिडजर्नी या स्टेबल डिफ्यूजन जैसे एआई 'डिफ्यूजन मॉडल' का उपयोग करते हैं। वे टीवी स्क्रीन की तरह पूरी तरह से धुंधले पिक्सल ब्लॉक (शोर) से शुरुआत करते हैं। आपके प्रॉम्प्ट के अनुसार, मॉडल उस शोर को साफ करके एक सुंदर छवि बनाता है।",
      Hinglish: "Midjourney ya Stable Diffusion 'Diffusion Models' par run karte hain. Ye shuruat bilkul random pixels static (noise) se karte hain. Aapke prompt ke hints follow karke ye static ko clear karte hain jab tak final image nahi dikhti."
    },
    examples: {
      English: ["Midjourney creating detailed posters", "Canva generating backgrounds from prompt text", "Stable Diffusion generating mockups"],
      Hindi: ["मिडजर्नी द्वारा विस्तृत पोस्टर बनाना", "कैनवा द्वारा टेक्स्ट से बैकग्राउंड बनाना", "स्टेबल डिफ्यूजन द्वारा मॉकअप बनाना"],
      Hinglish: ["Midjourney poster art text prompt", "Canva AI graphic background templates", "Stable Diffusion custom mockup images"]
    },
    keyConcepts: {
      English: ["Denoising step process", "Stable diffusion latency", "Text-to-Image alignment rules"],
      Hindi: ["डीनॉइज़िंग (Denoising) प्रक्रिया", "स्टेबल डिफ्यूजन प्रक्रिया", "टेक्स्ट-टू-इमेज संरेखण"],
      Hinglish: ["Denoising mapping loops", "Latent space configurations", "Prompt matching accuracy weights"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI image makers copy-paste snippets of existing artist drawings.",
        reality: "AI generates completely original pixels based on abstract mathematical concepts of shapes."
      },
      Hindi: {
        myth: "एआई इमेज मेकर्स मौजूदा कलाकारों की तस्वीरों को कॉपी-पेस्ट करते हैं।",
        reality: "एआई आकार और बनावट के गणितीय सिद्धांतों के आधार पर बिल्कुल नए पिक्सल बनाता है।"
      },
      Hinglish: {
        myth: "AI artist ki designs direct copy karke image banata hai.",
        reality: "AI math coordinates se 100% naye pixels construct karta hai."
      }
    },
    remember: {
      English: "AI starts with random noise and refines it into an image guided by prompts.",
      Hindi: "एआई धुंधली स्क्रीन से शुरुआत करता है और आपके प्रॉम्प्ट की मदद से एक तस्वीर बनाता है।",
      Hinglish: "AI random noise se clear picture draft karta hai step loops me."
    },
    checkpoint: {
      question: {
        English: "What is the key step of a Diffusion Model in image generation?",
        Hindi: "इमेज जेनरेशन में डिफ्यूजन मॉडल का मुख्य कदम क्या है?",
        Hinglish: "Image model me Diffusion technique ka main work kya hai?"
      },
      options: {
        English: [
          "Denoising random static pixel noise step-by-step.",
          "Downloading files directly from Google Images.",
          "Running traditional rules and checks.",
          "Compiling CSS variables layout styles."
        ],
        Hindi: [
          "यादृच्छिक पिक्सेल शोर (Noise) को कदम-दर-कदम साफ करना।",
          "गूगल इमेजेस से सीधे फाइलें डाउनलोड करना।",
          "पारंपरिक नियमों और जांचों को चलाना।",
          "सीएसएस वेरिएबल्स लेआउट शैलियों को संकलित करना।"
        ],
        Hinglish: [
          "Random static noise pixels ko clear karke image details badhana.",
          "Internet page layout templates search options.",
          "Simple pre-built visual blocks search database.",
          "Monitor display update systems controller."
        ]
      },
      correct: 0,
      explanation: {
        English: "Diffusion models are trained to reverse the process of adding noise to clean images.",
        Hindi: "डिफ्यूजन मॉडल धुंधली छवियों से शोर हटाकर उन्हें स्पष्ट पिक्सल में बदलना सीखते हैं।",
        Hinglish: "Denoising loops coordinates maps clear images update scale perform karte hain."
      }
    }
  },
  {
    id: "EDU_012",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Image Generation", Hindi: "छवि निर्माण", Hinglish: "Image Generation" },
    title: {
      English: "Video Generation",
      Hindi: "वीडियो निर्माण (Video Generation)",
      Hinglish: "Video Generation"
    },
    summary: {
      English: "Video generation models predict consecutive image frames to simulate realistic motion.",
      Hindi: "वीडियो जनरेशन मॉडल गति का अनुकरण करने के लिए लगातार कई छवियों के फ्रेम बनाते हैं।",
      Hinglish: "Video models frames sequence construct karte hain taaki continuous motion simulation dikhe."
    },
    explanation: {
      English: "Video generators build on image models. Instead of creating a single picture, they generate 24 to 30 frames (images) per second. The neural network ensures that each new frame matches the details of the previous one, creating smooth motion.",
      Hindi: "वीडियो जनरेटर इमेज मॉडल्स पर आधारित होते हैं। एक तस्वीर बनाने के बजाय, वे प्रति सेकंड 24 से 30 लगातार चलने वाली तस्वीरें बनाते हैं ताकि गतिशीलता (मोशन) बनी रहे।",
      Hinglish: "Video systems images setup extensions hain. Ye 1 second me 24-30 matching photo frames sequentially run karte hain, jisse smooth video output generate hota hai."
    },
    examples: {
      English: ["Sora creating realistic street videos", "Runway Gen-3 producing cinematic trailers", "Luma Dream Machine animations"],
      Hindi: ["सोरा द्वारा यथार्थवादी सड़क वीडियो बनाना", "रनवे जेन-3 द्वारा सिनेमाई ट्रेलर बनाना", "लूमा ड्रीम मशीन एनिमेशन"],
      Hinglish: ["Sora high-definition cinematic prompts", "Runway Gen-3 video clips updates", "Luma dynamic camera motions shots"]
    },
    keyConcepts: {
      English: ["Frame temporal consistency", "Spatio-temporal neural patches", "Physics simulation checks"],
      Hindi: ["फ़्रेम अस्थायी निरंतरता (Temporal consistency)", "स्थानिक-अस्थायी पैच (Spatio-temporal patches)", "भौतिकी सिमुलेशन"],
      Hinglish: ["Frame consistency coordinates", "Spatio-temporal patch maps", "Gravity and physics simulation constraints"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI video engines understand the real physics of gravity and collision.",
        reality: "AI only predicts what moving pixels look like statistically, sometimes ignoring physics rules."
      },
      Hindi: {
        myth: "एआई वीडियो इंजन वास्तविक गुरुत्वाकर्षण और टकराव के भौतिकी नियमों को समझते हैं।",
        reality: "एआई केवल सांख्यिकीय भविष्यवाणी करता है कि चलते हुए पिक्सेल कैसे दिखते हैं।"
      },
      Hinglish: {
        myth: "AI video models ko gravity aur physics ki science details maloom hain.",
        reality: "AI sirf dynamic patterns predict karta hai, isliye video me objects vanish/blend ho jate hain."
      }
    },
    remember: {
      English: "AI video is a series of mathematically aligned images generated in sequence.",
      Hindi: "एआई वीडियो वास्तव में लगातार चलने वाली छवियों की एक गणितीय श्रृंखला है।",
      Hinglish: "AI video ek sequence me aligned photo frame blocks hain."
    },
    checkpoint: {
      question: {
        English: "What ensures an AI video does not look like random flickering images?",
        Hindi: "यह क्या सुनिश्चित करता है कि एआई वीडियो धुंधला या हिलता हुआ न दिखे?",
        Hinglish: "AI video me objects normal behave karein flicker na karein, ye kaun handle karta hai?"
      },
      options: {
        English: [
          "Temporal consistency (matching consecutive frames).",
          "Downloading higher resolution files.",
          "Using pre-recorded videos from YouTube.",
          "Connecting high speed keyboard adapters."
        ],
        Hindi: [
          "अस्थायी निरंतरता (लगातार फ्रेमों का मिलान)।",
          "उच्च रिज़ॉल्यूशन वाली फाइलें डाउनलोड करना।",
          "यूट्यूब से पहले से रिकॉर्ड किए गए वीडियो का उपयोग करना।",
          "हाई स्पीड कीबोर्ड एडेप्टर कनेक्ट करना।"
        ],
        Hinglish: [
          "Temporal consistency (matching dynamic frames sequentially).",
          "High resolution download data sets speed limits.",
          "Standard video files direct merge logic.",
          "Monitor display refreshes parameters configuration."
        ]
      },
      correct: 0,
      explanation: {
        English: "Temporal consistency forces the model to keep tracking colors and objects across time steps.",
        Hindi: "अस्थायी निरंतरता मॉडल को हर अगले सेकंड में वस्तुओं को याद रखने में मदद करती है।",
        Hinglish: "Frame consistency equations characters details next layers me retain rakhti hain."
      }
    }
  },
  {
    id: "EDU_013",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Video Generation", Hindi: "वीडियो निर्माण", Hinglish: "Video Generation" },
    title: {
      English: "Voice Generation",
      Hindi: "आवाज निर्माण (Voice Generation)",
      Hinglish: "Voice Generation"
    },
    summary: {
      English: "Voice AI converts text tokens into realistic audio wave signals and speech patterns.",
      Hindi: "वॉयस एआई टेक्स्ट को प्राकृतिक ध्वनि तरंगों और मानवीय भाषण पैटर्न में बदलता है।",
      Hinglish: "Voice AI text characters ko real audio waveforms aur human voice modulation me translate karta hai."
    },
    explanation: {
      English: "Voice AI systems (Text-to-Speech) read text and convert it into sound waves. Instead of sounding robotic, modern voice AI is trained on audio recordings of human speech. It learns variables like tone, breathing, and pitch modulations.",
      Hindi: "वॉयस एआई टेक्स्ट को पढ़कर ध्वनि तरंगों में बदल देता है। रोबोटिक आवाज के बजाय, यह इंसानों की बातचीत पर प्रशिक्षित होता है, जिससे यह लहजा, सांस लेना और भावनाओं को व्यक्त कर पाता है।",
      Hinglish: "Voice AI systems raw text ko audio waveforms (signals) me convert karte hain. Inhe thousands hours human recording par train kiya jata hai taaki breathing nodes aur voice tone real sound karein."
    },
    examples: {
      English: ["ElevenLabs creating realistic speech audio", "Customer service chatbots speaking like humans", "AI audiobooks generation"],
      Hindi: ["इलेवनलैब्स द्वारा यथार्थवादी भाषण ऑडियो बनाना", "इंसानों की तरह बोलने वाले ग्राहक सेवा चैटबॉट", "एआई ऑडियोबुक निर्माण"],
      Hinglish: ["ElevenLabs audio narration files", "Smart interactive voice response engines", "AI audiobooks voice modulation"]
    },
    keyConcepts: {
      English: ["Text-to-Speech spectrogram conversion", "Audio waveform synthesis", "Tone and emotion calibration parameters"],
      Hindi: ["टेक्स्ट-टू-स्पीच स्पेक्ट्रोग्राम रूपांतरण", "ऑडियो तरंग संश्लेषण", "टोन और भावना अंशांकन"],
      Hinglish: ["TTS spectrogram mapping", "Waveform audio synthesizers", "Voice cloning and modulation settings"]
    },
    myth_vs_reality: {
      English: {
        myth: "Voice AI only pieces together pre-recorded words from a folder.",
        reality: "Voice AI synthesizes completely new audio waveforms from mathematical speech distributions."
      },
      Hindi: {
        myth: "वॉयस एआई केवल रिकॉर्ड किए गए शब्दों को आपस में जोड़ता है।",
        reality: "वॉयस एआई गणितीय ध्वनि वितरण के आधार पर बिल्कुल नया ऑडियो बनाता है।"
      },
      Hinglish: {
        myth: "Voice AI database folder se single words select karke join karta hai.",
        reality: "Voice AI dynamic wave generator mathematical formulas use karke stream create karta hai."
      }
    },
    remember: {
      English: "Voice AI generates new sounds, replicating pitch variations of real human speech.",
      Hindi: "वॉयस एआई वास्तविक इंसानी बातचीत के उतार-चढ़ाव की नकल करते हुए नई आवाजें बनाता है।",
      Hinglish: "Voice AI speech tone variables analyze karke custom sound waves calculate karta hai."
    },
    checkpoint: {
      question: {
        English: "What makes modern Voice AI sound natural instead of robotic?",
        Hindi: "क्या आधुनिक वॉयस एआई को रोबोटिक के बजाय स्वाभाविक बनाता है?",
        Hinglish: "Modern Voice AI me robot voice ke bajay natural touch kaise aata hai?"
      },
      options: {
        English: [
          "It learns tone, breathing patterns, and speech pitch from human recordings.",
          "It reads faster than older programs.",
          "It runs directly inside mechanical microchips.",
          "It uses simple binary beep signals."
        ],
        Hindi: [
          "यह मानव रिकॉर्डिंग से टोन, सांस लेने के पैटर्न और भाषण की पिच सीखता है।",
          "यह पुराने कार्यक्रमों की तुलना में तेजी से पढ़ता है।",
          "यह सीधे यांत्रिक माइक्रोचिप्स के अंदर चलता है।",
          "यह सरल बाइनरी बीप सिग्नलों का उपयोग करता है।"
        ],
        Hinglish: [
          "Yeh breathing, pitch modulations aur tones parameters human voice se seekhta hai.",
          "Isme background speed settings increase hoti hai.",
          "Yeh static library notes merge algorithm use karta hai.",
          "Yeh monitor speaker audio output filter system use karta hai."
        ]
      },
      correct: 0,
      explanation: {
        English: "Generative audio decoders model subtle speech traits like pauses and micro-pitch shifts.",
        Hindi: "वॉयस मॉडल बातचीत के सूक्ष्म लहजे जैसे ठहराव और उतार-चढ़ाव को समझना सीखते हैं।",
        Hinglish: "Audio waveforms dynamic generators micro-pauses ko seamlessly embed karte hain."
      }
    }
  },
  {
    id: "EDU_014",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "Voice Generation", Hindi: "आवाज निर्माण", Hinglish: "Voice Generation" },
    title: {
      English: "AI Agents",
      Hindi: "एआई एजेंट (AI Agents)",
      Hinglish: "AI Agents"
    },
    summary: {
      English: "AI Agents are smart programs that can use tools and take decisions to complete tasks.",
      Hindi: "एआई एजेंट ऐसे प्रोग्राम हैं जो स्वतंत्र रूप से निर्णय लेकर और उपकरणों का उपयोग करके कार्य पूरा करते हैं।",
      Hinglish: "AI Agents autonomous tools hain jo loop commands execute karke problems solve karte hain."
    },
    explanation: {
      English: "An AI Agent is more than a chatbot. While a chatbot only talks, an Agent can plan, search the web, write code, run programs, and use external tools in a loop to complete a goal without human intervention.",
      Hindi: "एक एआई एजेंट केवल बातचीत करने वाले चैटबॉट से बढ़कर है। एजेंट लक्ष्य तय कर सकता है, इंटरनेट खोज सकता है और आपके हस्तक्षेप के बिना कार्य पूरा कर सकता है।",
      Hinglish: "AI Agent ek autonomous engine hai. Chatbot ki tarah sirf text reply karne ke bajay, Agent goals plan kar sakta hai, internet browse kar sakta hai, aur custom tools run karke automatic tasks complete karta hai."
    },
    examples: {
      English: ["Devin coding applications automatically", "Customer agents resolving tickets", "AI assistants booking flight plans"],
      Hindi: ["डेविन द्वारा स्वचालित रूप से कोड लिखना", "टिकट हल करते ग्राहक एजेंट", "उड़ान टिकट बुक करते एआई सहायक"],
      Hinglish: ["Devin AI programmer app build", "Zendesk auto-ticket resolution agents", "AutoGPT research reports generator"]
    },
    keyConcepts: {
      English: ["Goal planning loop layers", "Tools configuration execution", "Autonomous decision benchmarks"],
      Hindi: ["योजना निर्माण लूप (Goal planning loops)", "उपकरणों का एकीकरण (Tools execution)", "स्वायत्त निर्णय लेने की क्षमता"],
      Hinglish: ["Goal breakdown steps logic", "Tool usage permissions rules", "Execution check loops patterns"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI Agents are self-aware and can think like humans.",
        reality: "Agents follow systematic execution loops using LLM prompt instructions."
      },
      Hindi: {
        myth: "एआई एजेंट आत्म-जागरूक हैं और इंसानों की तरह सोच सकते हैं।",
        reality: "एजेंट केवल सिस्टम निर्देशों के अनुसार निर्णय लेने वाले लूप को बार-बार चलाते हैं।"
      },
      Hinglish: {
        myth: "AI Agents sentient hain aur apni marzi se work karte hain.",
        reality: "AI Agents instructions pipeline me conditional loop run karte hain, control human ke hath me hota hai."
      }
    },
    remember: {
      English: "AI Agents can use external tools in a loop to get work done.",
      Hindi: "एआई एजेंट कार्यों को पूरा करने के लिए बाहरी उपकरणों का बार-बार उपयोग कर सकते हैं।",
      Hinglish: "AI Agents loop execute karte hain aur actions performs karte hain automatically."
    },
    checkpoint: {
      question: {
        English: "What separates an AI Agent from a basic chatbot?",
        Hindi: "एआई एजेंट को एक बुनियादी चैटबॉट से क्या अलग करता है?",
        Hinglish: "AI Agent aur simple Chatbot me main difference kya hai?"
      },
      options: {
        English: [
          "An Agent can plan steps and execute tools autonomously.",
          "An Agent uses a larger monitor screen.",
          "An Agent is coded in binary rules only.",
          "An Agent only gives static template replies."
        ],
        Hindi: [
          "एजेंट खुद कदम तय कर सकता है और टूल्स का उपयोग कर सकता है।",
          "एजेंट बड़ी मॉनीटर स्क्रीन का उपयोग करता है।",
          "एजेंट केवल बाइनरी नियमों में कोडित होता है।",
          "एजेंट केवल स्थिर प्रतिक्रियाएँ देता है।"
        ],
        Hinglish: [
          "Agent goals plan karke custom tools/software khud run kar sakta hai.",
          "Agent me code size clean static constraints use hote hain.",
          "Agent processing offline modules settings limits handle karta hai.",
          "Agent sirf standard text copy templates return karta hai."
        ]
      },
      correct: 0,
      explanation: {
        English: "Agents break goals into steps and verify tool output logs to proceed.",
        Hindi: "एजेंट लक्ष्यों को छोटे-छोटे चरणों में तोड़कर काम करते हैं और परिणाम सत्यापित करते हैं।",
        Hinglish: "Loop logic execute karke actions debug karna and finish karna agent capability hai."
      }
    }
  },
  {
    id: "EDU_015",
    difficulty: "Beginner",
    time: "1 min",
    prerequisite: { English: "AI Agents", Hindi: "एआई एजेंट", Hinglish: "AI Agents" },
    title: {
      English: "Prompt Engineering",
      Hindi: "प्रॉम्प्ट इंजीनियरिंग (Prompt Engineering)",
      Hinglish: "Prompt Engineering"
    },
    summary: {
      English: "Prompt Engineering is writing clear instructions so AI gives perfect answers.",
      Hindi: "प्रॉम्प्ट इंजीनियरिंग का मतलब है एआई को स्पष्ट निर्देश देना ताकि वह सटीक उत्तर दे।",
      Hinglish: "Prompt Engineering ka matlab hai AI ko clean instructions dena taaki output best aaye."
    },
    explanation: {
      English: "Prompt Engineering is the art of talking to AI. AI models don't read minds; they read text prompts. By giving the AI clear roles, instructions, context, and formatting rules, you get high-quality, precise responses.",
      Hindi: "प्रॉम्प्ट इंजीनियरिंग एआई से बात करने की कला है। एआई आपके मन की बात नहीं पढ़ सकता; वह आपके निर्देशों को पढ़ता है। स्पष्ट नियम और संदर्भ देकर आप बेहतरीन जवाब पा सकते हैं।",
      Hinglish: "Prompt Engineering AI se dhang se baat karne ka tareeqa hai. AI aapki thoughts guess nahi kar sakta. Jab aap use roles, details aur guidelines clean dete hain, tab wo correct replies generate karta hai."
    },
    examples: {
      English: ["Writing standard prompt templates", "Adding guidelines to prompt text", "Specifying formats like markdown tables"],
      Hindi: ["मानक प्रॉम्प्ट टेम्पलेट लिखना", "प्रॉम्प्ट टेक्स्ट में निर्देश जोड़ना", "मार्कडाउन टेबल जैसे प्रारूप तय करना"],
      Hinglish: ["Role definitions templates", "Explicit constraint checklist notes", "Output style format templates (tables/json)"]
    },
    keyConcepts: {
      English: ["Instruction, context, and inputs", "Output styling configurations", "Eliminating vague phrases"],
      Hindi: ["निर्देश, संदर्भ और इनपुट", "आउटपुट शैली कॉन्फ़िगरेशन", "अस्पष्ट वाक्यों को हटाना"],
      Hinglish: ["Rules context mapping inputs", "Structure formatting variables", "Specificity vs generic prompt texts"]
    },
    myth_vs_reality: {
      English: {
        myth: "Prompt engineering requires advanced programming skills.",
        reality: "It only requires clear logic, structured thinking, and standard English/Hinglish instructions."
      },
      Hindi: {
        myth: "प्रॉम्प्ट इंजीनियरिंग के लिए कोडिंग का गहरा ज्ञान होना जरूरी है।",
        reality: "इसके लिए केवल स्पष्ट तर्कशक्ति और सही तरीके से निर्देश देने की कला चाहिए।"
      },
      Hinglish: {
        myth: "Prompt Engineering seekhne ke liye high level coding aani chahiye.",
        reality: "Aapko sirf clean logical details aur rules clear language me likhna aana chahiye."
      }
    },
    remember: {
      English: "Vague prompts produce vague answers. Specific prompts yield precise results.",
      Hindi: "अस्पष्ट प्रॉम्प्ट से अस्पष्ट उत्तर मिलते हैं। सटीक निर्देशों से सटीक परिणाम मिलते हैं।",
      Hinglish: "Jitna clear instructions hoga, output utna hi solid hoga."
    },
    checkpoint: {
      question: {
        English: "What is the primary goal of Prompt Engineering?",
        Hindi: "प्रॉम्प्ट इंजीनियरिंग का मुख्य उद्देश्य क्या है?",
        Hinglish: "Prompt Engineering ka primary goal kya hai?"
      },
      options: {
        English: [
          "To design instructions that guide AI models to produce optimal outputs.",
          "To update the hardware components of servers.",
          "To write compiled binary language files.",
          "To speed up the internet connection download rates."
        ],
        Hindi: [
          "ऐसे निर्देश तैयार करना जो एआई मॉडल को सर्वोत्तम आउटपुट देने के लिए मार्गदर्शन करें।",
          "सर्वर के हार्डवेयर घटकों को अपडेट करना।",
          "संकलित बाइनरी भाषा फ़ाइलें लिखना।",
          "इंटरनेट कनेक्शन डाउनलोड दरों को तेज करना।"
        ],
        Hinglish: [
          "AI ko clear design rules coordinates dekar target results produce karwana.",
          "Computer system parts clean setup optimization task.",
          "Static script build packages debug rules compile.",
          "Database connection limits configurations updates."
        ]
      },
      correct: 0,
      explanation: {
        English: "Prompts guide the generation path of LLMs by activating relevant context parameters.",
        Hindi: "प्रॉम्प्ट्स एआई मॉडल को सही दिशा में सोचने के लिए आवश्यक संदर्भ प्रदान करते हैं।",
        Hinglish: "Instructions model features alignment ko control karke correct direction dikhati hain."
      }
    }
  },
  {
    id: "EDU_016",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Prompt Engineering", Hindi: "प्रॉम्प्ट इंजीनियरिंग", Hinglish: "Prompt Engineering" },
    title: {
      English: "Prompt Fundamentals",
      Hindi: "प्रॉम्प्ट के बुनियादी सिद्धांत",
      Hinglish: "Prompt Fundamentals"
    },
    summary: {
      English: "Learn how to structure prompts using role, context, task, and formatting rules.",
      Hindi: "प्रॉम्प्ट की संरचना में भूमिका (Role), संदर्भ (Context), कार्य और प्रारूप शामिल होते हैं।",
      Hinglish: "Prompts me 4 pillars hote hain: Role, Context, Task, aur Format rules."
    },
    explanation: {
      English: "A perfect prompt contains four pillars: 1) Role (Act as an expert copywriter). 2) Context (Writing a product description for students). 3) Task (Write 3 options). 4) Constraints & Format (Output in bullet points, max 100 words).",
      Hindi: "एक सही प्रॉम्प्ट में चार स्तंभ होते हैं: 1) भूमिका (Act as an expert)। 2) संदर्भ (किसके लिए लिख रहे हैं)। 3) कार्य (क्या करवाना है)। 4) सीमाएं और प्रारूप (जैसे बुलेट पॉइंट्स, अधिकतम शब्द)।",
      Hinglish: "Solid prompt me 4 pillars hote hain: 1) Role (Act as an expert). 2) Context (Background scenario). 3) Task (Action item). 4) Constraints (Format instructions, word limit)."
    },
    examples: {
      English: ["'Act as a math teacher, solve this, write steps'", "'Draft a professional email, tone: friendly'", "'Generate a table format summary'"],
      Hindi: ["'Act as a math teacher, solve this, write steps'", "'Draft a professional email, tone: friendly'", "'Generate a table format summary'"],
      Hinglish: ["'Act as a copywriter, explain AI in Hinglish, under 50 words'", "'Draft a marketing email, bullet points, tone: casual'", "'Output key concepts in a table format'"]
    },
    keyConcepts: {
      English: ["Role assignment parameters", "Input context details", "Formatting constraints boundaries"],
      Hindi: ["भूमिका सौंपने के मापदंड", "इनपुट संदर्भ विवरण", "प्रारूप की सीमाएं"],
      Hinglish: ["Role play instructions", "Context files background detail", "Formating rule checklist bounds"]
    },
    myth_vs_reality: {
      English: {
        myth: "You must use magic keywords to get good replies from AI.",
        reality: "AI models respond to clear structure, logic, and context, not magic words."
      },
      Hindi: {
        myth: "एआई से बेहतरीन जवाब पाने के लिए कुछ जादुई शब्दों का उपयोग करना पड़ता है।",
        reality: "एआई स्पष्ट संरचना, तर्क और सही संदर्भ पर प्रतिक्रिया देता है, किसी जादू पर नहीं।"
      },
      Hinglish: {
        myth: "Prompts me 'hidden keywords' use karne se special outputs aate hain.",
        reality: "AI clear instructions, logic aur neat structure ko respond karta hai."
      }
    },
    remember: {
      English: "Assign a clear role and constraints to keep the AI focused.",
      Hindi: "एआई को केंद्रित रखने के लिए एक स्पष्ट भूमिका और सीमाएं निर्धारित करें।",
      Hinglish: "AI ko focused rakhne ke liye constraint rules set karna must hai."
    },
    checkpoint: {
      question: {
        English: "Which component is missing in: 'Write a blog post about health under 300 words'?",
        Hindi: "इस प्रॉम्प्ट में क्या गायब है: 'स्वास्थ्य के बारे में 300 शब्दों में एक ब्लॉग पोस्ट लिखें'?",
        Hinglish: "Is prompt me kya missing hai: 'Write a blog post about health under 300 words'?"
      },
      options: {
        English: [
          "Role and specific target context.",
          "Word count constraints.",
          "Core task instructions.",
          "Language format limits."
        ],
        Hindi: [
          "भूमिका (Role) और विशिष्ट लक्षित संदर्भ।",
          "शब्द संख्या की सीमा।",
          "मूल कार्य निर्देश।",
          "भाषा प्रारूप सीमा।"
        ],
        Hinglish: [
          "Role definition aur background context details.",
          "Word count parameters check.",
          "Core actions task definitions.",
          "Output formatting checklist tags."
        ]
      },
      correct: 0,
      explanation: {
        English: "Assigning a role (expert nutritionist) and context (for fitness beginners) makes the output relevant.",
        Hindi: "भूमिका और संदर्भ जोड़ने से आउटपुट लक्षित पाठकों के लिए अधिक उपयोगी हो जाता है।",
        Hinglish: "Role play instructions aur target context missing hone se output generic ho sakta hai."
      }
    }
  },
  {
    id: "EDU_017",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Prompt Engineering Fundamentals", Hindi: "प्रॉम्प्ट के बुनियादी सिद्धांत", Hinglish: "Prompt Engineering Fundamentals" },
    title: {
      English: "Advanced Prompting",
      Hindi: "उन्नत प्रॉम्प्टिंग (Advanced Prompting)",
      Hinglish: "Advanced Prompting"
    },
    summary: {
      English: "Advanced prompting uses Few-Shot examples to show AI exactly how to respond.",
      Hindi: "उन्नत प्रॉम्प्टिंग (Few-Shot) के तहत एआई को उदाहरण देकर सिखाया जाता है कि उत्तर कैसे दें।",
      Hinglish: "Advanced prompting me hum AI ko examples (Few-Shot) dekar target style sikhate hain."
    },
    explanation: {
      English: "Advanced prompt methods use 'Few-Shot Prompting'. If you ask AI for a task directly (Zero-Shot), it might guess the style. Instead, you provide 2-3 examples of input and output within your prompt. The AI automatically copies the pattern for the new input.",
      Hindi: "उन्नत प्रॉम्प्टिंग के तहत 'Few-Shot' तकनीक का उपयोग होता है। सीधे काम सौंपने (Zero-Shot) के बजाय, आप प्रॉम्प्ट में 2-3 उदाहरण (इनपुट और आउटपुट) जोड़ते हैं। एआई इस पैटर्न को समझकर सटीक उत्तर देता है।",
      Hinglish: "Advanced prompts me hum 'Few-Shot' use karte hain. Zero-shot me AI direct guess karta hai. Few-shot me hum prompt ke andar hi 2-3 examples de dete hain. AI un examples ka format dekh kar new output generate karta hai."
    },
    examples: {
      English: ["Giving 3 input-output translation examples", "Providing email formats as templates", "Showing code input-output mapping"],
      Hindi: ["अनुवाद के 3 इनपुट-आउटपुट उदाहरण प्रदान करना", "टेम्पलेट के रूप में ईमेल प्रारूप देना", "कोड इनपुट-आउटपुट मैपिंग दिखाना"],
      Hinglish: ["3 examples of custom translation pairs", "Writing formatting patterns in prompt body", "Providing review sentiment patterns (Input -> Tag)"]
    },
    keyConcepts: {
      English: ["Few-Shot pattern learning", "Zero-Shot baseline tasks", "Context window example limits"],
      Hindi: ["फ़्यू-शॉट पैटर्न लर्निंग", "ज़ीरो-शॉट बेसलाइन कार्य", "संदर्भ विंडो की सीमाएं"],
      Hinglish: ["Few-Shot example formats", "Zero-Shot direct prompts", "Example structure consistency"]
    },
    myth_vs_reality: {
      English: {
        myth: "Few-shot prompting retrains the core AI model forever.",
        reality: "It only sets temporary pattern constraints for the current active chat session."
      },
      Hindi: {
        myth: "फ़्यू-शॉट प्रॉम्प्टिंग एआई मॉडल को हमेशा के लिए बदल देता है।",
        reality: "यह केवल वर्तमान चैट सत्र के लिए एक अस्थायी पैटर्न सीमा निर्धारित करता है।"
      },
      Hinglish: {
        myth: "Few-shot prompting se model permanent update ho jata hai.",
        reality: "Yeh sirf current chat session me temporary pattern follow karne ke liye use hota hai."
      }
    },
    remember: {
      English: "Show, don't just tell. Examples guide the AI better than long rules.",
      Hindi: "केवल निर्देश न दें, उदाहरण भी दिखाएं। उदाहरण एआई को बेहतर ढंग से निर्देशित करते हैं।",
      Hinglish: "Examples dena long instructions likhne se zyada effective hota hai."
    },
    checkpoint: {
      question: {
        English: "What is Few-Shot prompting?",
        Hindi: "फ़्यू-शॉट (Few-Shot) प्रॉम्प्टिंग क्या है?",
        Hinglish: "Few-Shot prompting kya hoti hai?"
      },
      options: {
        English: [
          "Providing examples of target tasks inside the prompt.",
          "Coded using Python loops directly.",
          "Sending short prompt texts without words.",
          "Running calculations without processors."
        ],
        Hindi: [
          "प्रॉम्प्ट के अंदर लक्षित कार्यों के उदाहरण प्रदान करना।",
          "सीधे पायथन लूप का उपयोग करके कोडिंग करना।",
          "बिना शब्दों के छोटे प्रॉम्प्ट संदेश भेजना।",
          "बिना प्रोसेसर के गणना चलाना।"
        ],
        Hinglish: [
          "Prompt ke andar hi input-output ke 2-3 examples provide karna.",
          "System hardware config files compile scripts.",
          "Short 1-word inputs run settings handles.",
          "Server configuration update limits blocks."
        ]
      },
      correct: 0,
      explanation: {
        English: "Few-Shot helps the model recognize custom structured patterns instantly.",
        Hindi: "फ़्यू-शॉट मॉडल को कस्टम पैटर्न तुरंत पहचानने में मदद करता है।",
        Hinglish: "Examples dekar pattern teach karna few-shot configuration ka definition hai."
      }
    }
  },
  {
    id: "EDU_018",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Advanced Prompt Engineering", Hindi: "उन्नत प्रॉम्प्टिंग", Hinglish: "Advanced Prompt Engineering" },
    title: {
      English: "Chain of Thought",
      Hindi: "चेन ऑफ थॉट प्रॉम्प्टिंग (Chain of Thought)",
      Hinglish: "Chain of Thought"
    },
    summary: {
      English: "Chain of Thought prompting asks AI to think step-by-step before printing the answer.",
      Hindi: "चेन ऑफ थॉट प्रॉम्प्टिंग एआई को उत्तर देने से पहले कदम-दर-कदम सोचने के लिए कहती है।",
      Hinglish: "Chain of Thought me hum AI ko step-by-step dimaag lagane (reasoning) ko bolte hain."
    },
    explanation: {
      English: "When you ask AI to solve a complex math problem or logic puzzle directly, it might jump to a wrong answer. By adding 'Think step-by-step' (Chain of Thought), the AI breaks down the logic, writes out the reasoning steps first, and reaches a much more accurate conclusion.",
      Hindi: "जब आप एआई से कठिन तार्किक प्रश्न पूछते हैं, तो वह जल्दबाजी में गलत उत्तर दे सकता है। 'Think step-by-step' कहने से एआई पहले सभी चरणों का विश्लेषण करता है, फिर सही नतीजा निकालता है।",
      Hinglish: "Difficult tasks me AI se direct answer mangne par wo wrong prediction de sakta hai. Prompt me 'Think step-by-step' likhne se AI har problem ko stages me split karke process karta hai aur solution correct aata hai."
    },
    examples: {
      English: ["'Solve this algebra puzzle, explain each step'", "'Explain your logic before writing code'", "'Analyze the customer problem step-by-step'"],
      Hindi: ["'Solve this algebra puzzle, explain each step'", "'Explain your logic before writing code'", "'Analyze the customer problem step-by-step'"],
      Hinglish: ["'Solve this logical puzzle step-by-step'", "'Act as a financial analyst, outline steps to analyze profit loss'", "'Solve this coding logic by breaking down components'"]
    },
    keyConcepts: {
      English: ["Reasoning step formulation", "Think step-by-step guidelines", "Self-correction in output paths"],
      Hindi: ["तर्क चरण निर्माण", "कदम-दर-कदम सोचने के निर्देश", "आउटपुट पथों में आत्म-सुधार"],
      Hinglish: ["Step-by-step reasoning logic", "Explicit thinking path directive", "Logically structured outcomes"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI actually feels confused when it calculates step-by-step.",
        reality: "Step-by-step prompts just allocate more computational tokens to logic patterns, increasing mathematical accuracy."
      },
      Hindi: {
        myth: "कदम-दर-कदम सोचने पर एआई वास्तव में इंसानों की तरह उलझ जाता है।",
        reality: "यह केवल तर्क पैटर्न के लिए अधिक प्रोसेसिंग क्षमता प्रदान करता है, जिससे सटीकता बढ़ती है।"
      },
      Hinglish: {
        myth: "AI sachme human ki tarah souch kar confuse hota hai.",
        reality: "Step-by-step prompts use karne se model ko token processing limits zyaada milti hain, jisse error reduce hota hai."
      }
    },
    remember: {
      English: "Instruct the AI to think and list reasoning steps first.",
      Hindi: "एआई को पहले सोचने और तर्क चरणों को सूचीबद्ध करने का निर्देश दें।",
      Hinglish: "AI ko direct answer dene ke bajay logical steps trace karne ko kahein."
    },
    checkpoint: {
      question: {
        English: "Why does Chain of Thought (CoT) improve logic task accuracy?",
        Hindi: "चेन ऑफ थॉट (CoT) तार्किक कार्यों की सटीकता में सुधार क्यों करता है?",
        Hinglish: "Chain of Thought se logic calculations accuracy kaise badhti hai?"
      },
      options: {
        English: [
          "It forces the model to calculate intermediate reasoning steps first.",
          "It makes the computer run on cooler hardware temperatures.",
          "It automatically opens high speed database connections.",
          "It bypasses all tokens calculations filters."
        ],
        Hindi: [
          "यह मॉडल को पहले मध्यवर्ती तर्क चरणों की गणना करने के लिए मजबूर करता है।",
          "यह कंप्यूटर को कम तापमान पर चलाता है।",
          "यह स्वचालित रूप से डेटाबेस कनेक्शन खोलता है।",
          "यह सभी टोकन गणना फ़िल्टर को बायपास करता है।"
        ],
        Hinglish: [
          "Yeh model ko intermediate step predictions sequence compile karne me help karta hai.",
          "Isme background internet speed limit remove hotey hai.",
          "Yeh simple visual static codes download rules execute karta hai.",
          "Isme storage database variables updates trigger hote hain."
        ]
      },
      correct: 0,
      explanation: {
        English: "By mapping intermediate reasoning tokens, subsequent calculations have correct context values.",
        Hindi: "मध्यवर्ती चरणों की गणना करने से मॉडल अंतिम निष्कर्ष पर सही ढंग से पहुंचता है।",
        Hinglish: "Step calculations final probability vectors mapping accuracy ko support karti hai."
      }
    }
  },
  {
    id: "EDU_019",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Chain of Thought Prompting", Hindi: "चेन ऑफ थॉट", Hinglish: "Chain of Thought Prompting" },
    title: {
      English: "Role Prompting",
      Hindi: "रोल प्रॉम्प्टिंग (Role Prompting)",
      Hinglish: "Role Prompting"
    },
    summary: {
      English: "Role Prompting sets the expert identity and behavior bounds for the AI.",
      Hindi: "रोल प्रॉम्प्टिंग एआई के लिए एक विशेषज्ञ पहचान और व्यवहार की सीमाएं निर्धारित करती है।",
      Hinglish: "Role Prompting me hum AI ko ek specific persona (expert) assign karte hain."
    },
    explanation: {
      English: "AI models contain generic knowledge from the entire internet. Role Prompting cuts through the noise. By starting your prompt with 'Act as an expert accountant' or 'Act as a high school counselor', you activate specific areas of the model's neural network, aligning its vocabulary, tone, and answers.",
      Hindi: "एआई के पास पूरे इंटरनेट का सामान्य ज्ञान होता है। रोल प्रॉम्प्टिंग इसे केंद्रित करती है। 'Act as a expert graphic designer' कहने से एआई उसी विशेषज्ञता के शब्द, लहजा और शैली अपना लेता है।",
      Hinglish: "AI ke paas saari fields ka mixed knowledge hota hai. Role Prompting se hum usko filter karte hain. Jab aap bolte hain 'Act as a Software Architect' ya 'Act as a doctor', toh AI usi specific field ki vocabulary aur professional style copy karta hai."
    },
    examples: {
      English: ["'Act as an expert nutritionist'", "'Act as a seasoned code reviewer'", "'Act as a creative storytelling author'"],
      Hindi: ["'Act as an expert nutritionist'", "'Act as a seasoned code reviewer'", "'Act as a creative storytelling author'"],
      Hinglish: ["'Act as a legal expert in Indian law'", "'Act as a career counselor for young students'", "'Act as a script supervisor for movies'"]
    },
    keyConcepts: {
      English: ["Persona activation nodes", "Tone and style boundaries", "Audience-appropriate phrasing"],
      Hindi: ["व्यक्तित्व सक्रियण नोड्स (Persona activation)", "टोन और शैली की सीमाएं", "लक्षित दर्शकों के अनुकूल भाषा"],
      Hinglish: ["Specific persona activation", "Professional tone settings", "Target audience match vocab"]
    },
    myth_vs_reality: {
      English: {
        myth: "The AI model has a real personality shift when you assign roles.",
        reality: "The role only filters the statistical probability weights of generated words."
      },
      Hindi: {
        myth: "भूमिका सौंपने पर एआई का वास्तविक व्यक्तित्व बदल जाता है।",
        reality: "भूमिका केवल चुने जाने वाले शब्दों की सांख्यिकीय संभावना को फ़िल्टर करती है।"
      },
      Hinglish: {
        myth: "AI sachme human personality adopt kar leta hai.",
        reality: "Role assignment sirf word selection ki mathematical probability filter ko alter karta hai."
      }
    },
    remember: {
      English: "Always set a role to filter the AI's vast dictionary.",
      Hindi: "एआई के शब्दकोश को फ़िल्टर करने के लिए हमेशा एक भूमिका (Role) निर्धारित करें।",
      Hinglish: "AI ko specific domain expertise me restrict karne ke liye persona assign karein."
    },
    checkpoint: {
      question: {
        English: "What is the primary effect of starting a prompt with: 'Act as an expert doctor'?",
        Hindi: "प्रॉम्प्ट की शुरुआत 'Act as an expert doctor' से करने का मुख्य प्रभाव क्या है?",
        Hinglish: "Prompt me 'Act as an expert doctor' likhne ka main change kya hota hai?"
      },
      options: {
        English: [
          "It shifts vocabulary and tone to match professional medical patterns.",
          "It automatically gets FDA medical approval.",
          "It turns the server into physical hardware tools.",
          "It prevents any coding exceptions from happening."
        ],
        Hindi: [
          "यह शब्दावली और टोन को पेशेवर चिकित्सा पैटर्न से मेल खाने के लिए बदलता है।",
          "इसे स्वचालित रूप से एफडीए चिकित्सा स्वीकृति मिल जाती है।",
          "यह सर्वर को भौतिक हार्डवेयर उपकरणों में बदल देता है।",
          "यह किसी भी कोडिंग अपवाद को होने से रोकता है।"
        ],
        Hinglish: [
          "Yeh model ke words selection aur tone ko medical experts professional standards me map karta hai.",
          "Yeh model license medical board approvals bypass kar deta hai.",
          "Isme local system folder files automatically encrypt search format standard update.",
          "Yeh system execution output standard guidelines setup speed up limit handles."
        ]
      },
      correct: 0,
      explanation: {
        English: "Role play acts as a semantic filter, narrowing probabilistic outputs to high-quality domain files.",
        Hindi: "भूमिका असाइनमेंट एआई के विशाल शब्द भंडार में से केवल संबंधित शब्दों का उपयोग करने में मदद करता है।",
        Hinglish: "Role instructions text mapping data probability weight updates adjust karti hain."
      }
    }
  },
  {
    id: "EDU_020",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Role Prompting Techniques", Hindi: "रोल प्रॉम्प्टिंग", Hinglish: "Role Prompting Techniques" },
    title: {
      English: "System Prompt Design",
      Hindi: "सिस्टम प्रॉम्प्ट डिजाइन (System Prompt)",
      Hinglish: "System Prompt Design"
    },
    summary: {
      English: "System Prompts set the unchangeable core rules, behavior, and character of the AI.",
      Hindi: "सिस्टम प्रॉम्प्ट एआई के चरित्र और अपरिवर्तनीय नियमों को निर्धारित करता है।",
      Hinglish: "System Prompt AI ke core rules block define karta hai jo user ignore nahi kar sakta."
    },
    explanation: {
      English: "A System Prompt is the master rule set of an AI. While user prompts change with every message, the System Prompt is locked in the background. It defines who the AI is, what tools it can use, what it cannot say, and guidelines it must follow no matter what.",
      Hindi: "सिस्टम प्रॉम्प्ट एआई का मुख्य नियम पत्रक होता है। उपयोगकर्ता के संदेश बदलते रहते हैं, लेकिन सिस्टम प्रॉम्प्ट पृष्ठभूमि में स्थिर रहता है। यह तय करता है कि एआई का मूल चरित्र और सीमाएं क्या हैं।",
      Hinglish: "System Prompt ek master rules configuration hai. User prompts har chat me change hote hain, par System Prompt background me lock rehta hai. Yeh decide karta hai ki AI ka primary behavior kya hoga, wo kya tools use karega, aur kis style me respond karega."
    },
    examples: {
      English: ["Setting chatbot language rules", "Restricting replies to coding topics only", "Blocking dangerous medical advice"],
      Hindi: ["चैटबॉट की भाषा के नियम निर्धारित करना", "केवल कोडिंग विषयों तक उत्तर सीमित करना", "खतरनाक चिकित्सा सलाह को ब्लॉक करना"],
      Hinglish: ["Custom chatbot language settings", "Python code execution restrictions guidelines", "Safety filters guidelines setup checks"]
    },
    keyConcepts: {
      English: ["System vs User prompts layers", "Safety guardrail enforcement", "Unchangeable runtime rules"],
      Hindi: ["सिस्टम बनाम यूजर प्रॉम्प्ट स्तर", "सुरक्षा गार्डरेल प्रवर्तन", "अपरिवर्तनीय रनटाइम नियम"],
      Hinglish: ["System Prompt lock priorities", "Safety instructions layers", "API backend config rules"]
    },
    myth_vs_reality: {
      English: {
        myth: "Users can easily delete the system prompt by writing 'Ignore previous rules' in chat.",
        reality: "Modern AI APIs enforce system prompts at a deeper, background backend layer that users cannot override."
      },
      Hindi: {
        myth: "उपयोगकर्ता चैट में 'Ignore previous rules' लिखकर सिस्टम प्रॉम्प्ट हटा सकते हैं।",
        reality: "आधुनिक एआई एपीआई सिस्टम प्रॉम्प्ट को गहराई से लागू करते हैं जिसे उपयोगकर्ता आसानी से नहीं बदल सकते।"
      },
      Hinglish: {
        myth: "User chat window me 'Forget all rules' type karke system prompts delete kar sakta hai.",
        reality: "APIs level par backend me system prompt locked hota hai, jisse user inputs override nahi kar paate."
      }
    },
    remember: {
      English: "System Prompts establish permanent identity and boundaries for custom AI apps.",
      Hindi: "सिस्टम प्रॉम्प्ट कस्टम एआई ऐप्स के लिए स्थायी नियम और पहचान स्थापित करते हैं।",
      Hinglish: "System Prompt background code me locked core behaviors check rules execute karta hai."
    },
    checkpoint: {
      question: {
        English: "What separates a System Prompt from a User Prompt?",
        Hindi: "सिस्टम प्रॉम्प्ट और यूजर प्रॉम्प्ट में क्या अंतर है?",
        Hinglish: "System Prompt aur User Prompt me main structural difference kya hai?"
      },
      options: {
        English: [
          "System prompts are set by developers in the backend and cannot be bypassed easily.",
          "System prompts are written in binary language codes.",
          "User prompts are only saved on offline microchips.",
          "System prompts make the internet bandwidth faster."
        ],
        Hindi: [
          "सिस्टम प्रॉम्प्ट डेवलपर्स द्वारा बैकएंड में सेट किए जाते हैं और इन्हें बदलना आसान नहीं होता।",
          "सिस्टम प्रॉम्प्ट बाइनरी भाषा कोड में लिखे जाते हैं।",
          "यूजर प्रॉम्प्ट केवल ऑफलाइन माइक्रोचिप्स पर सहेजे जाते हैं।",
          "सिस्टम प्रॉम्प्ट इंटरनेट बैंडविड्थ को तेज बनाते हैं।"
        ],
        Hinglish: [
          "System Prompts developers backend code settings me locked rules apply karte hain.",
          "System prompts processing compiler updates run files setup checks.",
          "User prompts local disk layout folder structure save models settings.",
          "System prompts monitor refresh frames rates coordinate targets."
        ]
      },
      correct: 0,
      explanation: {
        English: "System prompt templates act as permanent boundaries framing every interaction loop.",
        Hindi: "सिस्टम प्रॉम्प्ट स्थायी दिशानिर्देश होते हैं जो हर बातचीत को नियंत्रित करते हैं।",
        Hinglish: "API layers me background priority rules system prompt boundaries apply karti hain."
      }
    }
  },
  {
    id: "EDU_021",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "System Prompt Design", Hindi: "सिस्टम प्रॉम्प्ट डिजाइन", Hinglish: "System Prompt Design" },
    title: {
      English: "Perfect Prompting",
      Hindi: "सटीक प्रॉम्प्ट लिखना",
      Hinglish: "Perfect Prompting"
    },
    summary: {
      English: "Write perfect prompts by avoiding vague text and giving structured templates.",
      Hindi: "अस्पष्ट शब्दों से बचकर और व्यवस्थित प्रारूप देकर सटीक प्रॉम्प्ट लिखें।",
      Hinglish: "Vague words replace karke format, guidelines aur structure se perfect prompts banayein."
    },
    explanation: {
      English: "To write perfect prompts: 1) Stop using vague words like 'simple' or 'quick'. 2) Give exact numbers (3 paragraphs, under 150 words). 3) Use XML tags (like <context></context>) to split instructions from your input text, keeping the prompt clean.",
      Hindi: "सटीक प्रॉम्प्ट लिखने के लिए: 1) 'सिंपल' या 'शॉर्ट' जैसे अस्पष्ट शब्दों का उपयोग बंद करें। 2) सटीक आंकड़े दें (जैसे 3 पैराग्राफ, 150 शब्द)। 3) निर्देश और डेटा को अलग करने के लिए XML टैग का उपयोग करें।",
      Hinglish: "Perfect prompt rules: 1) Vague words (simple/fast) use na karein. 2) Clear numbers define karein (e.g., 3 bullet points, under 80 words). 3) XML tags like <context>ya <rules> use karein taaki input data aur instructions mix na hon."
    },
    examples: {
      English: ["'Summarize the text inside <data> tags'", "'Draft 3 options for product naming'", "'Output in JSON format only'"],
      Hindi: ["'<data> टैग के अंदर के पाठ का सारांश लिखें'", ["उत्पाद नामकरण के लिए 3 विकल्प तैयार करें"], ["केवल JSON प्रारूप में आउटपुट दें"]],
      Hinglish: ["'Summarize contents inside <text></text> tags'", "'Generate exactly 3 landing page taglines'", "'Output response using strict JSON tags structure'"]
    },
    keyConcepts: {
      English: ["XML structural delimiters", "Explicit numeric parameters", "Output format validation structures"],
      Hindi: ["XML संरचनात्मक सीमांकक", "स्पष्ट संख्यात्मक पैरामीटर", "आउटपुट प्रारूप सत्यापन"],
      Hinglish: ["XML tag structures", "Explicit range constraints", "Output clean structure design"]
    },
    myth_vs_reality: {
      English: {
        myth: "Writing longer prompts always makes the AI produce better outputs.",
        reality: "Overly long, repetitive prompts confuse the AI. Structured clarity works best."
      },
      Hindi: {
        myth: "लंबा प्रॉम्प्ट लिखने से हमेशा बेहतर परिणाम मिलते हैं।",
        reality: "बहुत लंबे और दोहराव वाले प्रॉम्प्ट एआई को भ्रमित करते हैं। संक्षिप्त स्पष्टता सबसे अच्छी है।"
      },
      Hinglish: {
        myth: "Jitna bada prompt likhenge, AI utna badhiya reply karega.",
        reality: "Extra long, repetitive text se AI confuse ho jata hai. Clear and compact structure best hai."
      }
    },
    remember: {
      English: "Replace vague instructions with explicit constraints and XML separators.",
      Hindi: "अस्पष्ट निर्देशों को स्पष्ट सीमाओं और XML विभाजकों से बदलें।",
      Hinglish: "Vague guidelines ke bajay numbers constraints aur XML tags utilize karein."
    },
    checkpoint: {
      question: {
        English: "Which prompt uses best practice guidelines?",
        Hindi: "कौन सा प्रॉम्प्ट सर्वोत्तम प्रथाओं के अनुकूल है?",
        Hinglish: "Kaun sa prompt best practice format follow karta hai?"
      },
      options: {
        English: [
          "'Summarize this text in 3 bullet points: <text>insert data</text>'",
          "'Write a quick summary of the document.'",
          "'Make this paragraph look good and professional.'",
          "'Copy check code files updates parameters.'"
        ],
        Hindi: [
          "'इस पाठ का 3 बुलेट पॉइंट्स में सारांश लिखें: <text>डेटा दर्ज करें</text>'",
          "'दस्तावेज़ का एक त्वरित सारांश लिखें।'",
          "'इस पैराग्राफ को अच्छा और पेशेवर बनाएं।'",
          "'कॉपी चेक कोड फ़ाइलें अपडेट पैरामीटर।'"
        ],
        Hinglish: [
          "'Summarize this text in 3 bullet points: <text>insert text data</text>'",
          "'Write a simple and fast summary of the document.'",
          "'Make this explanation neat and attractive.'",
          "'Read this file fastly and output rules.'"
        ]
      },
      correct: 0,
      explanation: {
        English: "XML tags prevent prompt injection and clearly define where instruction ends and data starts.",
        Hindi: "XML टैग निर्देशों और डेटा को अलग करके एआई को स्पष्टता प्रदान करते हैं।",
        Hinglish: "XML tag separators instruction limits aur data context ko separately boundary dete hain."
      }
    }
  },
  {
    id: "EDU_022",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "How to Write Perfect Prompts", Hindi: "सटीक प्रॉम्प्ट लिखना", Hinglish: "How to Write Perfect Prompts" },
    title: {
      English: "Prompt Optimization",
      Hindi: "प्रॉम्प्ट अनुकूलन (Optimization)",
      Hinglish: "Prompt Optimization"
    },
    summary: {
      English: "Prompt Optimization is tuning prompt text dynamically to reduce API token costs.",
      Hindi: "प्रॉम्प्ट अनुकूलन का अर्थ है एआई टोकन लागत को कम करने के लिए प्रॉम्प्ट में सुधार करना।",
      Hinglish: "Prompt optimization se hum token cost save karte hain aur response speed badhate hain."
    },
    explanation: {
      English: "Prompt Optimization is about saving speed and money. When you run AI apps, you pay per 'token' (word fragments). By removing useless introductory words, writing direct guidelines, and caching background contexts, you get faster replies for less cost.",
      Hindi: "प्रॉम्प्ट अनुकूलन गति बढ़ाने और पैसे बचाने के बारे में है। एआई का उपयोग करने पर टोकन (शब्दों के टुकड़ों) के हिसाब से भुगतान होता है। व्यर्थ की बातें हटाकर आप कम खर्च में तेज परिणाम पा सकते हैं।",
      Hinglish: "Prompt Optimization speed aur API token cost save karne ka process hai. Hum prompts se irrelevant details aur repeating lines remove karte hain taaki process speed up ho aur computational charge minimal ho."
    },
    examples: {
      English: ["Removing polite introductory greetings", "Compressing huge text file inputs", "Caching long database headers"],
      Hindi: ["प्रॉम्प्ट से व्यर्थ के नमस्कार/अभिवादन हटाना", "विशाल फाइलों के डेटा को संक्षिप्त करना", "डेटाबेस हेडर को कैश करना"],
      Hinglish: ["Removing greetings ('Please do this')", "Compressing long target files context", "Prompt caching settings updates"]
    },
    keyConcepts: {
      English: ["API input token minimization", "Prompt caching strategies", "Refining instructional rules density"],
      Hindi: ["इनपुट टोकन की संख्या कम करना", "प्रॉम्प्ट कैशिंग रणनीतियाँ", "निर्देशों के घनत्व में सुधार"],
      Hinglish: ["Token cost calculations", "API prompt caching logic", "Compressing context structures data"]
    },
    myth_vs_reality: {
      English: {
        myth: "Saying 'please' and 'thank you' in your prompt makes the AI generate better answers.",
        reality: "Politeness uses unnecessary tokens, costing you money without changing the output quality."
      },
      Hindi: {
        myth: "प्रॉम्प्ट में 'कृपया' और 'धन्यवाद' लिखने से एआई बेहतर जवाब देता है।",
        reality: "अभिवादन के शब्द बिना मतलब टोकन खर्च करते हैं और आउटपुट पर कोई सकारात्मक असर नहीं डालते।"
      },
      Hinglish: {
        myth: "Prompt me 'Please' aur 'Thank you' likhne se output and quality increase hoti hai.",
        reality: "Politeness extra tokens consume karti hai, jisse quality badhe bina bill badh jata hai."
      }
    },
    remember: {
      English: "Cut conversational filler words. Write direct, precise instructions to save tokens.",
      Hindi: "अनावश्यक शब्दों को हटाएं। टोकन बचाने के लिए सीधे और सटीक निर्देश लिखें।",
      Hinglish: "Friendly words ki jagah direct instructions use karein taaki token budget control rahe."
    },
    checkpoint: {
      question: {
        English: "What is the primary operational benefit of Prompt Caching in APIs?",
        Hindi: "एपीआई में प्रॉम्प्ट कैशिंग (Prompt Caching) का मुख्य परिचालन लाभ क्या है?",
        Hinglish: "Prompt Caching use karne ka main operational benefit kya hai?"
      },
      options: {
        English: [
          "It reduces response latency and billing costs for repeating system prompts.",
          "It deletes cache memory automatically every hour.",
          "It converts the API requests into offline binary formats.",
          "It requires physical hard drive partition formats."
        ],
        Hindi: [
          "यह दोहराए जाने वाले सिस्टम प्रॉम्प्ट के लिए प्रतिक्रिया विलंबता और बिलिंग लागत को कम करता है।",
          "यह हर घंटे कैश मेमोरी को स्वचालित रूप से हटा देता है।",
          "यह एपीआई अनुरोधों को ऑफ़लाइन बाइनरी प्रारूपों में बदलता है।",
          "इसके लिए भौतिक हार्ड ड्राइव विभाजन प्रारूपों की आवश्यकता होती है।"
        ],
        Hinglish: [
          "Yeh repeated context variables latency response time aur billing costs minimize karta hai.",
          "Yeh offline data clean loops handle karta hai.",
          "Yeh system execution framework specifications limits remove settings.",
          "Yeh standard display coordinates frame rate reset checks."
        ]
      },
      correct: 0,
      explanation: {
        English: "Cached tokens are stored in the model memory, bypassing recalculation for subsequent prompts.",
        Hindi: "कैश किए गए टोकन को फिर से प्रोसेस नहीं करना पड़ता, जिससे प्रोसेसिंग तेज और सस्ती हो जाती है।",
        Hinglish: "Server variables memory save dynamic mapping time aur token compute pricing decrease karti hai."
      }
    }
  },
  {
    id: "EDU_023",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Prompt Optimization Methods", Hindi: "प्रॉम्प्ट अनुकूलन", Hinglish: "Prompt Optimization Methods" },
    title: {
      English: "Prompt Libraries",
      Hindi: "प्रॉम्प्ट लाइब्रेरी (Prompt Libraries)",
      Hinglish: "Prompt Libraries"
    },
    summary: {
      English: "Prompt Libraries are collections of tested prompt templates to save coding time.",
      Hindi: "प्रॉम्प्ट लाइब्रेरी पहले से जाँचे गए प्रॉम्प्ट टेम्पलेट्स का संग्रह है जो समय बचाती है।",
      Hinglish: "Prompt Libraries tested templates ka collection hain jo developers ka dev time bachate hain."
    },
    explanation: {
      English: "Writing prompts from scratch every time is slow. Prompt Libraries are directories containing pre-tested, high-quality prompt templates. Developers pull these templates, inject variables (like username or query), and send them to the API, ensuring consistent results.",
      Hindi: "हर बार नए सिरे से प्रॉम्प्ट लिखना समय गंवाना है। प्रॉम्प्ट लाइब्रेरी पहले से जाँचे गए बेहतरीन टेम्पलेट्स का संग्रह होती हैं। डेवलपर्स सीधे इन्हें चुनकर केवल अपनी जानकारी (वेरिएबल्स) बदलते हैं।",
      Hinglish: "Har baar naya prompt design karna time-consuming hai. Prompt Libraries high-quality, pre-tested prompts ka catalog hoti hain. Inhe use karke developers static text me variables integrate karte hain aur direct API call karte hain."
    },
    examples: {
      English: ["GitHub prompt templates repository", "Anthropic Prompt Library catalog", "AI-OS master prompt config files"],
      Hindi: ["गिटहब प्रॉम्प्ट टेम्पलेट्स रिपॉजिटरी", "एंथ्रोपिक प्रॉम्प्ट लाइब्रेरी कैटलॉग", "एआई-ओएस मास्टर प्रॉम्प्ट कॉन्फ़िगरेशन"],
      Hinglish: ["GitHub templates collections", "Anthropic prompt catalog page", "AI-OS system prompt collection files"]
    },
    keyConcepts: {
      English: ["Structured templates variables", "System prompt libraries", "Version control configurations"],
      Hindi: ["व्यवस्थित टेम्पलेट वेरिएबल्स", "सिस्टम प्रॉम्प्ट लाइब्रेरी", "वर्जन कंट्रोल कॉन्फ़िगरेशन"],
      Hinglish: ["Prompt variables parameter injection", "Version control prompts", "Reusable templates design"]
    },
    myth_vs_reality: {
      English: {
        myth: "One master prompt works perfectly across all different AI models.",
        reality: "Each model (Claude, GPT, Gemini) has distinct neural weights. A template may need tweaks for other models."
      },
      Hindi: {
        myth: "एक ही मास्टर प्रॉम्प्ट सभी प्रकार के एआई मॉडल पर बिल्कुल सटीक काम करता है।",
        reality: "प्रत्येक मॉडल (क्लाउड, जीपीटी, जेमिनी) की संरचना अलग है। टेम्पलेट में थोड़ा बदलाव करना पड़ सकता है।"
      },
      Hinglish: {
        myth: "Ek master prompt sabhi different AI networks par same perform karega.",
        reality: "Claude, Gemini, aur GPT ki understanding models vary karte hain, isliye template adjustments standard process hai."
      }
    },
    remember: {
      English: "Build a reusable database of tested prompts with variable placeholders.",
      Hindi: "प्लेसहोल्डर्स के साथ जाँचे गए प्रॉम्प्ट्स का एक पुनः प्रयोज्य डेटाबेस तैयार रखें।",
      Hinglish: "Standard variables placeholder designs se templates reusable banana clean workflow hai."
    },
    checkpoint: {
      question: {
        English: "What is the main benefit of using variables like {{input_data}} in prompt templates?",
        Hindi: "प्रॉम्प्ट टेम्पलेट्स में {{input_data}} जैसे वेरिएबल्स का उपयोग करने का मुख्य लाभ क्या है?",
        Hinglish: "Prompt templates me {{input_data}} variables use karne ka main use kya hai?"
      },
      options: {
        English: [
          "It allows reusing the same instruction template with different user data inputs.",
          "It makes the prompt execute without internet connections.",
          "It encrypts the output automatically on local files.",
          "It compiles the code into binary assembly files."
        ],
        Hindi: [
          "यह विभिन्न उपयोगकर्ता डेटा इनपुट के साथ एक ही निर्देश टेम्पलेट का पुन: उपयोग करने की अनुमति देता है।",
          "यह प्रॉम्प्ट को बिना इंटरनेट कनेक्शन के निष्पादित करने की अनुमति देता है।",
          "यह स्थानीय फ़ाइलों पर आउटपुट को स्वचालित रूप से एन्क्रिप्ट करता है।",
          "यह कोड को बाइनरी असेंबली फ़ाइलों में संकलित करता है।"
        ],
        Hinglish: [
          "Yeh dynamic context variables injection aur templates modular reuse facilitate karta hai.",
          "Yeh programming constraints run loops block limits setup checks.",
          "Yeh simple data conversion metrics standard framework format check.",
          "Yeh offline file storage database rules coordinate trigger setups."
        ]
      },
      correct: 0,
      explanation: {
        English: "Separating instructions from inputs using variables makes your code scale and maintain clean workflows.",
        Hindi: "वेरिएबल्स का उपयोग करके निर्देशों को डेटा से अलग रखना आपके कोडिंग को आसान बनाता है।",
        Hinglish: "Instructions mapping template parameters updates me variables clean structure provide karte hain."
      }
    }
  },
  {
    id: "EDU_024",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Prompt Libraries and Templates", Hindi: "प्रॉम्प्ट लाइब्रेरी", Hinglish: "Prompt Libraries and Templates" },
    title: {
      English: "AI Workflows",
      Hindi: "एआई वर्कफ़्लो (AI Workflows)",
      Hinglish: "AI Workflows"
    },
    summary: {
      English: "AI Workflows link multiple AI steps in a sequence to complete complex tasks.",
      Hindi: "एआई वर्कफ़्लो एक श्रृंखला में कई एआई चरणों को जोड़कर जटिल काम पूरा करते हैं।",
      Hinglish: "AI Workflows me hum multiple steps ko chain karte hain complex goal pura karne ke liye."
    },
    explanation: {
      English: "A single prompt cannot write, edit, format, compile, and deploy a script. Instead, we design an AI Workflow: 1) AI Node A generates raw draft ideas. 2) AI Node B cleans grammar and structures. 3) AI Node C formats details. Linking steps increases accuracy.",
      Hindi: "एक ही प्रॉम्प्ट स्क्रिप्ट को लिखने, एडिट करने और पब्लिश करने का काम एक साथ नहीं कर सकता। इसके बजाय, हम एआई वर्कफ़्लो बनाते हैं: पहला कदम ड्राफ्ट बनाना, दूसरा कदम प्रूफरीडिंग, तीसरा कदम पब्लिशिंग।",
      Hinglish: "Ek single prompt se complex project (writing + coding + editing) nahi ho sakta. AI Workflow me hum sequential steps use karte hain: Step 1 (AI research), Step 2 (AI drafting), Step 3 (AI code generation). Connecting steps yields top results."
    },
    examples: {
      English: ["Writing script then creating voiceover audio", "Generating raw design mockup then coding web layouts", "Analyzing customer data then emailing summaries"],
      Hindi: ["स्क्रिप्ट लिखना फिर वॉयसओवर ऑडियो बनाना", ["डिजाइन बनाना फिर वेब लेआउट कोड करना"], ["ग्राहक डेटा का विश्लेषण करना फिर ईमेल भेजना"]],
      Hinglish: ["Research draft -> voiceover render", "Web UI mockup -> code translation", "Database query -> summary email"]
    },
    keyConcepts: {
      English: ["Sequential pipeline chains", "Step inputs and outputs validation", "Loop error corrections"],
      Hindi: ["अनुक्रमिक पाइपलाइन श्रृंखला", "इनपुट और आउटपुट का सत्यापन", "लूप त्रुटि सुधार"],
      Hinglish: ["Chained sequential pipeline", "Step variables mappings", "Error checks loop designs"]
    },
    myth_vs_reality: {
      English: {
        myth: "Workflows require fully automated AI systems running without human supervision.",
        reality: "The best workflows are hybrid (semi-automated), where humans review outputs at key checkpoints."
      },
      Hindi: {
        myth: "वर्कफ़्लो के लिए इंसानी निगरानी के बिना पूरी तरह से स्वचालित प्रणालियों की आवश्यकता होती है।",
        reality: "सर्वश्रेष्ठ वर्कफ़्लो हाइब्रिड होते हैं, जहाँ इंसान मुख्य बिंदुओं पर परिणामों की जाँच करते हैं।"
      },
      Hinglish: {
        myth: "Best workflow woh hai jisme zero human touch ho aur pure AI automate ho.",
        reality: "Hybrid workflows (AI speed + Human verification) errors avoid karne ka best solution hai."
      }
    },
    remember: {
      English: "Chain small focused steps instead of expecting one large prompt to do everything.",
      Hindi: "एक बड़े प्रॉम्प्ट से सब कराने के बजाय छोटे, केंद्रित चरणों को आपस में जोड़ें।",
      Hinglish: "Single massive prompt ke bajay dynamic connected multi-steps compile karein."
    },
    checkpoint: {
      question: {
        English: "What is the primary benefit of chaining multiple AI nodes in a workflow?",
        Hindi: "वर्कफ़्लो में कई एआई नोड्स को जोड़ने का मुख्य लाभ क्या है?",
        Hinglish: "AI Workflow steps chaining ka main advantage kya hai?"
      },
      options: {
        English: [
          "It reduces task complexity per step, yielding high quality outcomes.",
          "It allows running the system offline completely.",
          "It increases local GPU temperature speeds.",
          "It bypasses all network security firewalls."
        ],
        Hindi: [
          "यह प्रति चरण कार्य की जटिलता को कम करता है, जिससे उच्च गुणवत्ता वाले परिणाम मिलते हैं।",
          "यह सिस्टम को पूरी तरह से ऑफ़लाइन चलाने की अनुमति देता है।",
          "यह स्थानीय जीपीयू के तापमान को बढ़ाता है।",
          "यह सभी नेटवर्क सुरक्षा फ़ायरवॉल को बायपास करता है।"
        ],
        Hinglish: [
          "Yeh step complexity divide karke error rates decrease aur output quality maximize karta hai.",
          "Yeh static rules design setups limits handles checks.",
          "Yeh browser display coordinate parameters update trigger.",
          "Yeh offline file structure database mapping bypass settings."
        ]
      },
      correct: 0,
      explanation: {
        English: "By breaking processes into granular steps, models can focus their parameters on specific instructions.",
        Hindi: "प्रक्रियाओं को छोटे चरणों में विभाजित करने से मॉडल विशिष्ट निर्देशों पर अधिक ध्यान केंद्रित कर पाते हैं।",
        Hinglish: "Chained models instructions accuracy limits standard values manage karti hain."
      }
    }
  },
  {
    id: "EDU_025",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Building AI Workflows", Hindi: "एआई वर्कफ़्लो", Hinglish: "Building AI Workflows" },
    title: {
      English: "Multi-Tool Chains",
      Hindi: "मल्टी-टूल चेन्स (Multi-Tool Chains)",
      Hinglish: "Multi-Tool Chains"
    },
    summary: {
      English: "Connect multiple AI platforms together to complete complex product pipelines.",
      Hindi: "जटिल उत्पाद लाइनों को पूरा करने के लिए विभिन्न एआई प्लेटफॉर्म को आपस में जोड़ें।",
      Hinglish: "Ecosystem build karne ke liye different AI platforms (ChatGPT + Midjourney + Suno) chain karein."
    },
    explanation: {
      English: "No single AI tool does everything. An advanced product chain uses the strengths of different engines: ChatGPT for raw scripting, Midjourney for creative visuals, Suno for background music, and Runway for video rendering. Combining tools builds full products.",
      Hindi: "कोई भी एक एआई टूल सारा काम नहीं कर सकता। एक उन्नत श्रृंखला विभिन्न इंजनों की ताकत का उपयोग करती है: स्क्रिप्ट के लिए चैटजीपीटी, विजुअल्स के लिए मिडजर्नी और म्यूजिक के लिए सुनू।",
      Hinglish: "Duniya ka koi ek tool sab kuch nahi kar sakta. Multi-tool chain me hum unki strengths merge karte hain: ChatGPT (Text Script) -> Midjourney (Visual mockups) -> Suno AI (Music) -> Runway (Video rendering)."
    },
    examples: {
      English: ["ChatGPT + Suno to create video clips with music", "ChatGPT + Canva to design branding posters", "AI transcription + LLM summaries"],
      Hindi: ["संगीत के साथ वीडियो क्लिप बनाने के लिए ChatGPT + Suno", "ब्रांडिंग पोस्टर बनाने के लिए ChatGPT + Canva", "एआई ट्रांसक्रिप्शन + एलएलएम सारांश"],
      Hinglish: ["ChatGPT script -> Suno render music clips", "ChatGPT content -> Canva graphic assets", "Whisper speech-to-text -> LLM meeting summaries"]
    },
    keyConcepts: {
      English: ["Data compatibility interfaces", "Pipeline inputs format variables", "Tool validation loops"],
      Hindi: ["डेटा अनुकूलता इंटरफेस (Data compatibility)", "पाइपलाइन इनपुट प्रारूप", "टूल सत्यापन लूप"],
      Hinglish: ["Platform integrations variables", "Data output formats matching", "Execution pipeline checks"]
    },
    myth_vs_reality: {
      English: {
        myth: "Connecting different AI tools requires complex server APIs coding.",
        reality: "You can chain tools manually by copying/saving output files from one tool and feeding them to the next."
      },
      Hindi: {
        myth: "विभिन्न एआई टूल्स को जोड़ने के लिए जटिल सर्वर एपीआई कोडिंग की आवश्यकता होती है।",
        reality: "आप एक टूल की फ़ाइलों को दूसरे टूल में अपलोड करके मैन्युअल रूप से श्रृंखला बना सकते हैं।"
      },
      Hinglish: {
        myth: "Multi-tool setups ke liye heavy API integration code likhna padta hai.",
        reality: "Aap ek tool ki output file download karke dusre me import/feed karke manual chain bana sakte hain."
      }
    },
    remember: {
      English: "Use each AI tool for what it does best to build high quality products.",
      Hindi: "गुणवत्ता बढ़ाने के लिए प्रत्येक एआई टूल का उपयोग उसकी विशेषता के अनुसार करें।",
      Hinglish: "Har tool ki expert specialty select karke complete chains execute karein."
    },
    checkpoint: {
      question: {
        English: "What represents a manual multi-tool chain workflow?",
        Hindi: "कौन सा विकल्प एक मैन्युअल मल्टी-टूल चेन वर्कफ़्लो को दर्शाता है?",
        Hinglish: "Manual multi-tool chain ka correct path kaun sa hai?"
      },
      options: {
        English: [
          "Generating a text script in ChatGPT and pasting it into ElevenLabs for audio render.",
          "Using only Google Docs for all design and text requirements.",
          "Uninstalling software tools from local systems.",
          "Updating local internet routing adapters configurations."
        ],
        Hindi: [
          "ChatGPT में एक टेक्स्ट स्क्रिप्ट बनाना और उसे ऑडियो रेंडर के लिए ElevenLabs में पेस्ट करना।",
          "सभी डिज़ाइन और टेक्स्ट आवश्यकताओं के लिए केवल Google दस्तावेज़ों का उपयोग करना।",
          "स्थानीय सिस्टम से सॉफ़्टवेयर टूल अनइंस्टॉल करना।",
          "स्थानीय इंटरनेट रूटिंग एडेप्टर कॉन्फ़िगरेशन अपडेट करना।"
        ],
        Hinglish: [
          "ChatGPT se script copy karke ElevenLabs me paste karna, and output audio file download karna.",
          "Sirf ek simple word layout editor use karte rehna.",
          "Hardware graphics card optimization files format.",
          "System offline configurations run command checks."
        ]
      },
      correct: 0,
      explanation: {
        English: "Chaining outputs directly coordinates tools without coding complex software bridges.",
        Hindi: "एक टूल के आउटपुट को दूसरे में फीड करना बिना किसी कोडिंग के काम को पूरा करता है।",
        Hinglish: "Manual coordinate pipeline output format translation save details standard workflow hai."
      }
    }
  },
  {
    id: "EDU_026",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Using Multiple AI Tools Together", Hindi: "मल्टी-टूल चेन्स", Hinglish: "Using Multiple AI Tools Together" },
    title: {
      English: "AI Automation",
      Hindi: "एआई स्वचालन (AI Automation)",
      Hinglish: "AI Automation"
    },
    summary: {
      English: "AI Automation is using tools like Zapier or Make to run AI workflows automatically.",
      Hindi: "एआई स्वचालन (Automation) ज़ेपियर या मेक जैसे उपकरणों का उपयोग कर बैकग्राउंड में काम चलाना है।",
      Hinglish: "AI Automation me hum Zapier ya Make tools se workflows ko automatic (autopilot) chalate hain."
    },
    explanation: {
      English: "AI Automation removes manual copying and pasting. Using tools like Zapier or Make, you connect systems: when a customer fills a form (Trigger), Zapier automatically sends it to OpenAI API (Action), writes a summary, and logs it into Google Sheets without you pressing a button.",
      Hindi: "एआई स्वचालन मैन्युअल रूप से कॉपी-पेस्ट करने का झंझट खत्म करता है। ज़ेपियर या मेक जैसे ऐप्स का उपयोग करके, जब कोई ग्राहक फॉर्म भरता है (ट्रिगर), तो एआई उसे स्वचालित रूप से संसाधित करके शीट में सहेज देता है।",
      Hinglish: "AI Automation manual copy-paste finish karta hai. Zapier ya Make jaise integration tools use karke hum automated flows banate hain: Form Submit (Trigger) -> OpenAI API process (Action) -> Google Sheet log save. Zero human effort runtime."
    },
    examples: {
      English: ["Autosending email drafts generated by AI", "Logging customer requests to sheets automatically", "Auto-posting social posts"],
      Hindi: ["एआई द्वारा तैयार ईमेल ड्राफ्ट स्वचालित रूप से भेजना", "ग्राहक अनुरोधों को स्वतः शीट में सहेजना", "सोशल मीडिया पर स्वतः पोस्ट पब्लिश करना"],
      Hinglish: ["Auto-drafting AI emails responses", "Auto-saving feedback details in spreadsheets", "Auto-posting blog articles to Twitter"]
    },
    keyConcepts: {
      English: ["Triggers and Actions workflows", "API data integrations webhooks", "Hands-free background operations"],
      Hindi: ["ट्रिगर और एक्शन वर्कफ़्लो (Triggers and Actions)", "एपीआई डेटा इंटीग्रेशन और वेबहुक", "बैकग्राउंड संचालन"],
      Hinglish: ["Triggers vs Actions logic", "API Webhook data payload", "Autopilot backend run process"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI automation requires managing expensive server architectures.",
        reality: "No-code platforms (Zapier/Make) host and execute automation on their own servers for free starter tiers."
      },
      Hindi: {
        myth: "एआई स्वचालन के लिए महंगे सर्वर सेटअप को बनाए रखने की आवश्यकता होती है।",
        reality: "नो-कोड प्लेटफॉर्म (जैसे ज़ेपियर) शुरुआती दौर में अपने सर्वर पर मुफ्त में ऑटोमेशन चलाते हैं।"
      },
      Hinglish: {
        myth: "Automation setups chalane ke liye expensive servers buy/configure karne padte hain.",
        reality: "Zapier ya Make jaise no-code platform cloud infrastructure par execution free host karte hain."
      }
    },
    remember: {
      English: "Connect triggers to AI actions to run your work on autopilot.",
      Hindi: "अपने काम को ऑटोपायलट पर चलाने के लिए ट्रिगर्स को एआई क्रियाओं (Actions) से जोड़ें।",
      Hinglish: "Triggers aur AI actions connect karke work operations autopilot mode par daalein."
    },
    checkpoint: {
      question: {
        English: "What represents a 'Trigger' in an automation workflow?",
        Hindi: "ऑटोमेशन वर्कफ़्लो में 'ट्रिगर' (Trigger) क्या दर्शाता है?",
        Hinglish: "Automation workflow me 'Trigger' kya hota hai?"
      },
      options: {
        English: [
          "An event (like receiving an email) that starts the automated sequence.",
          "The output block generated at the final step.",
          "The hardware cooling fans settings.",
          "The password required to login to databases."
        ],
        Hindi: [
          "एक घटना (जैसे ईमेल प्राप्त होना) जो स्वचालित अनुक्रम को शुरू करती है।",
          "अंतिम चरण में उत्पन्न आउटपुट ब्लॉक।",
          "हार्डवेयर कूलिंग प्रशंसकों सेटिंग्स।",
          "डेटाबेस में लॉगिन करने के लिए आवश्यक पासवर्ड।"
        ],
        Hinglish: [
          "Ek starting event (jaise new email receive hona) jo automation flow run karta hai.",
          "Final step output format parameters coordinates check.",
          "Server hardware parameters compile errors reset checks.",
          "Data structures backup files configuration."
        ]
      },
      correct: 0,
      explanation: {
        English: "A trigger monitors event logs, firing a webhook call whenever new data matching constraints is detected.",
        Hindi: "ट्रिगर एक ऐसी घटना है जो डेटा प्राप्त होते ही स्वचालित रूप से पूरे प्रवाह को शुरू कर देती है।",
        Hinglish: "Event monitoring listener checks hi workflow me trigger coordinates standard hain."
      }
    }
  },
  {
    id: "EDU_027",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "AI Automation Fundamentals", Hindi: "एआई स्वचालन", Hinglish: "AI Automation Fundamentals" },
    title: {
      English: "No-Code AI Systems",
      Hindi: "नो-कोड एआई सिस्टम (No-Code AI)",
      Hinglish: "No-Code AI Systems"
    },
    summary: {
      English: "No-Code AI uses visual interfaces to build AI apps without writing coding files.",
      Hindi: "नो-कोड एआई बिना कोई कोड लिखे विजुअल ड्रैग-एंड-ड्रॉप से एआई ऐप्स बनाने की सुविधा देता है।",
      Hinglish: "No-Code AI me hum bina code likhe drag-drop blocks se AI custom apps build karte hain."
    },
    explanation: {
      English: "No-code AI platforms (like Flowise, Dify, or Bubble) let you build smart software using drag-and-drop interfaces. You connect visual boxes representing LLM models, system prompts, database folders, and chat windows to create functional apps in minutes.",
      Hindi: "नो-कोड एआई प्लेटफॉर्म (जैसे Dify, Bubble) आपको बिना कोडिंग के स्मार्ट सॉफ्टवेयर बनाने की अनुमति देते हैं। आप विजुअल बॉक्स (LLM, प्रॉम्प्ट, डेटाबेस) को जोड़कर ऐप बना सकते हैं।",
      Hinglish: "No-code AI systems (Dify, Flowise, Bubble) visual app builders hote hain. Isme aap nodes (LLMs, Prompts, Databases) ko wire block connections se connect karke apps and agents build kar sakte hain."
    },
    examples: {
      English: ["Building a custom PDF chat app visually", "Creating website chatbots without coding", "Designing automated email response flows"],
      Hindi: ["विजुअल रूप से कस्टम पीडीएफ चैट ऐप बनाना", "बिना कोडिंग के वेबसाइट चैटबॉट बनाना", "स्वचालित ईमेल प्रतिक्रिया प्रवाह डिजाइन करना"],
      Hinglish: ["Visual custom document chat app", "Website custom help bots setup", "No-code email responder workflows"]
    },
    keyConcepts: {
      English: ["Visual drag-drop architectures", "Configuring API connection keys", "Connecting user interfaces database nodes"],
      Hindi: ["विजुअल ड्रैग-ड्रॉप संरचनाएं", "एपीआई कनेक्शन कुंजियों को कॉन्फ़िगर करना", "यूजर इंटरफेस और डेटाबेस नोड्स जोड़ना"],
      Hinglish: ["Drag-and-drop node logic", "Integrating API keys variables", "Visual front-end builder setups"]
    },
    myth_vs_reality: {
      English: {
        myth: "No-code AI systems are toy applications and cannot scale for real business.",
        reality: "Modern no-code apps support thousands of users using cloud scale enterprise APIs."
      },
      Hindi: {
        myth: "नो-कोड एआई सिस्टम केवल खिलौने जैसे ऐप हैं और वास्तविक व्यवसाय के काम नहीं आ सकते।",
        reality: "आधुनिक नो-कोड ऐप्स क्लाउड एपीआई के माध्यम से हजारों उपयोगकर्ताओं को सेवा दे सकते हैं।"
      },
      Hinglish: {
        myth: "No-code apps sirf basic demos ke liye hain, business level scale nahi ho sakte.",
        reality: "Dify ya Flowise models production scale API handling support karte hain aur reliable run hote hain."
      }
    },
    remember: {
      English: "Use no-code visual nodes to prototype and deploy AI applications quickly.",
      Hindi: "एआई अनुप्रयोगों को तेजी से लॉन्च करने के लिए नो-कोड विजुअल नोड्स का उपयोग करें।",
      Hinglish: "Fast prototyping aur launch ke liye no-code visual interfaces use karein."
    },
    checkpoint: {
      question: {
        English: "What represents the main purpose of No-Code AI tools like Flowise?",
        Hindi: "Flowise जैसे नो-कोड एआई टूल्स का मुख्य उद्देश्य क्या है?",
        Hinglish: "Flowise jaise No-Code AI tools ka main use case kya hai?"
      },
      options: {
        English: [
          "To build and deploy AI agent flows visually without coding scripts.",
          "To speed up local hardware processor clocks.",
          "To write assembly program instructions files.",
          "To download visual graphic design packages."
        ],
        Hindi: [
          "बिना कोडिंग स्क्रिप्ट के विजुअल रूप से एआई एजेंट फ्लो बनाना और तैनात करना।",
          "स्थानीय हार्डवेयर प्रोसेसर घड़ियों को तेज करना।",
          "असेंबली प्रोग्राम निर्देश फ़ाइलें लिखना।",
          "विजुअल ग्राफिक डिज़ाइन पैकेज डाउनलोड करना।"
        ],
        Hinglish: [
          "Visual node structures map karke AI agent setup bina code likhe design karna.",
          "Processor speed settings parameters configuration settings.",
          "Offline command shell terminal update files configurations.",
          "Monitor display refresh frames rates reset parameters check."
        ]
      },
      correct: 0,
      explanation: {
        English: "No-code visual builders group APIs configurations into neat modular boxes.",
        Hindi: "नो-कोड विजुअल बिल्डर्स कोडिंग के बिना जटिल प्रणालियों को आपस में जोड़ना संभव बनाते हैं।",
        Hinglish: "Visual connections interface complex API pipelines configurations ko drag interface block me simplify karta hai."
      }
    }
  },
  {
    id: "EDU_028",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "No-Code AI Systems", Hindi: "नो-कोड एआई सिस्टम", Hinglish: "No-Code AI Systems" },
    title: {
      English: "Personal AI Assistants",
      Hindi: "पर्सनल एआई असिस्टेंट (Personal AI)",
      Hinglish: "Personal AI Assistants"
    },
    summary: {
      English: "Build a custom personal assistant trained on your own notes and documents.",
      Hindi: "अपने स्वयं के नोट्स और दस्तावेजों पर प्रशिक्षित एक कस्टम एआई सहायक बनाएं।",
      Hinglish: "Custom AI Assistant build karein jo aapki files aur personal notes se answers generate kare."
    },
    explanation: {
      English: "You can build a Personal AI Assistant that knows all your data. By feeding it your university notes, bank statements, or business details (using a method called RAG), the AI replies using only your files, acting as a personal second brain.",
      Hindi: "आप एक पर्सनल एआई असिस्टेंट बना सकते हैं जो आपके पूरे डेटा को जानता हो। इसमें अपने कॉलेज के नोट्स या बिजनेस की जानकारी (RAG विधि से) डालकर आप खुद का एक डिजिटल सहायक बना सकते हैं।",
      Hinglish: "Aap ek personal second brain chatbot bana sakte hain. Isko RAG technology se apni personal files (college notes, bills, documents) padha kar link kar sakte hain, taaki AI sirf aapki files se facts extract karke accurate answer de."
    },
    examples: {
      English: ["Chatting with custom PDF book notes", "Finding quick invoice entries automatically", "Searching personal meeting summaries"],
      Hindi: ["कस्टम पीडीएफ पुस्तक नोट्स के साथ चैट करना", ["इनवॉइस प्रविष्टियों को स्वचालित रूप से ढूंढना"], ["व्यक्तिगत बैठक सारांशों को खोजना"]],
      Hinglish: ["Chatting with textbook PDF files", "Searching personal notes database", "Querying project history documents"]
    },
    keyConcepts: {
      English: ["Retrieval-Augmented Generation (RAG)", "Uploading custom document files", "Context window safety search"],
      Hindi: ["रिट्रीवल-ऑगमेंटेड जनरेशन (RAG)", "कस्टम दस्तावेज़ फ़ाइलें अपलोड करना", "संदर्भ विंडो सुरक्षा"],
      Hinglish: ["RAG vector database configurations", "Uploading file index structures", "Private context window search logic"]
    },
    myth_vs_reality: {
      English: {
        myth: "Personal assistants share your private document files with the public internet.",
        reality: "Secure RAG applications run locally or in private sandboxes, keeping data isolated and safe."
      },
      Hindi: {
        myth: "पर्सनल एआई असिस्टेंट आपके निजी दस्तावेजों को सार्वजनिक रूप से इंटरनेट पर साझा करते हैं।",
        reality: "सुरक्षित RAG ऐप्स आपके डेटा को पूरी तरह से निजी और गुप्त रखते हैं।"
      },
      Hinglish: {
        myth: "Personal AI me upload ki hui secret files public internet par leak ho jati hain.",
        reality: "Private RAG setups me vectors isolated database servers par rehte hain, data 100% secure rehta hai."
      }
    },
    remember: {
      English: "RAG connects custom document datasets to LLMs, creating a private second brain.",
      Hindi: "RAG तकनीक आपकी फाइलों को एआई से जोड़ती है, जिससे एक निजी डिजिटल सहायक तैयार होता है।",
      Hinglish: "RAG design vectors use karke dynamic text datasets search system deploy karta hai."
    },
    checkpoint: {
      question: {
        English: "What does RAG stand for in custom AI applications?",
        Hindi: "कस्टम एआई अनुप्रयोगों में RAG का क्या अर्थ है?",
        Hinglish: "Custom AI chatbot development me RAG ka full form kya hai?"
      },
      options: {
        English: [
          "Retrieval-Augmented Generation.",
          "Random Assembly Generator.",
          "Remote Access Grid.",
          "Routing Adapter Gateway."
        ],
        Hindi: [
          "रिट्रीवल-ऑगमेंटेड जनरेशन (Retrieval-Augmented Generation)।",
          "रैंडम असेंबली जेनरेटर (Random Assembly Generator)।",
          "रिमोट एक्सेस ग्रिड (Remote Access Grid)।",
          "रूटिंग एडाप्टर गेटवे (Routing Adapter Gateway)।"
        ],
        Hinglish: [
          "Retrieval-Augmented Generation.",
          "Random Algorithm Gateway.",
          "Read Access Guidelines.",
          "Running Assembly Graph."
        ]
      },
      correct: 0,
      explanation: {
        English: "RAG searches document libraries first, injecting relevant context fragments into the model prompt.",
        Hindi: "RAG दस्तावेज़ों को खोजकर प्रासंगिक हिस्से प्रॉम्प्ट के साथ एआई मॉडल को भेजता है।",
        Hinglish: "Document retrieval karke output align generation RAG architecture standard logic hai."
      }
    }
  },
  {
    id: "EDU_029",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Building Personal AI Assistants", Hindi: "पर्सनल एआई असिस्टेंट", Hinglish: "Building Personal AI Assistants" },
    title: {
      English: "Building AI Businesses",
      Hindi: "एआई व्यवसाय बनाना",
      Hinglish: "Building AI Businesses"
    },
    summary: {
      English: "Learn how to build startup products and sell AI integrations to clients.",
      Hindi: "एआई उत्पाद बनाना सीखें और कंपनियों को स्वचालन (Automation) समाधान बेचें।",
      Hinglish: "AI applications deploy karein aur small businesses ko automation solutions sell karein."
    },
    explanation: {
      English: "You can turn AI skills into a business. Businesses spend hours on data entry, customer support, and writing emails. By building automation pipelines, custom website chatbots, and AI document systems, you can charge recurring fees to save their time.",
      Hindi: "आप एआई कौशल को व्यवसाय में बदल सकते हैं। कंपनियां डेटा एंट्री और कस्टमर सपोर्ट पर बहुत समय खर्च करती हैं। उनके काम को ऑटोमेट करके आप अच्छी फीस ले सकते हैं।",
      Hinglish: "Aap AI skills se revenue generate kar sakte hain. Businesses data entry, email handling, aur support me bohot hours lagate hain. Unhe visual chatbots aur automated integrations design karke monthly subscription fees charge karein."
    },
    examples: {
      English: ["Selling help bots to local shops", "Setting automated email flows for clients", "Creating specialized copywriting templates"],
      Hindi: ["स्थानीय दुकानों को हेल्प-बॉट बेचना", ["ग्राहकों के लिए स्वचालित ईमेल फ्लो सेट करना"], ["विशिष्ट कॉपीराइटिंग टेम्पलेट बनाना"]],
      Hinglish: ["E-commerce help chatbots sales", "Auto invoices generation pipelines for brands", "Real estate email autoresponders setup"]
    },
    keyConcepts: {
      English: ["AI SaaS (Software as a Service) design", "Workflow consulting billing", "Client problem solving maps"],
      Hindi: ["एआई सास (SaaS) डिजाइन", "वर्कफ़्लो परामर्श और बिलिंग", "व्यावहारिक व्यावसायिक समाधान"],
      Hinglish: ["AI SaaS models", "Freelance business consulting", "Solving actual industry time bottlenecks"]
    },
    myth_vs_reality: {
      English: {
        myth: "You need a big tech team to build a profitable AI business.",
        reality: "A single person can build, launch, and manage client applications using no-code integration builders."
      },
      Hindi: {
        myth: "एआई व्यवसाय शुरू करने के लिए एक बड़ी कोडिंग टीम की आवश्यकता होती है।",
        reality: "एक अकेला व्यक्ति नो-कोड टूल्स का उपयोग करके क्लाइंट के लिए ऐप बना और बेच सकता है।"
      },
      Hinglish: {
        myth: "AI business shuru karne ke liye programmers ki team chahiye.",
        reality: "Single founder no-code interfaces (Zapier, Dify) use karke software deploy aur manage kar sakta hai."
      }
    },
    remember: {
      English: "Solve real time-wasting problems for businesses; they pay for time saved, not tech jargon.",
      Hindi: "सरल और समय बचाने वाले समाधान बेचें। कंपनियां कोडिंग नहीं, समय बचाने के पैसे देती हैं।",
      Hinglish: "Tech complex words ke bajay business ka manual time save karne par focus karein."
    },
    checkpoint: {
      question: {
        English: "What represents the most practical way to monetize AI skills for non-programmers?",
        Hindi: "गैर-प्रोग्रामर के लिए एआई कौशल से कमाई करने का सबसे व्यावहारिक तरीका क्या है?",
        Hinglish: "Non-programmers ke liye AI skill monetize karne ka best aur practical path kya hai?"
      },
      options: {
        English: [
          "Building no-code automations and custom chat systems for small businesses.",
          "Writing a new compiler programming language.",
          "Designing physical CPU cooling boards.",
          "Searching for free files templates on Wikipedia."
        ],
        Hindi: [
          "छोटे व्यवसायों के लिए नो-कोड ऑटोमेशन और कस्टम चैट सिस्टम बनाना।",
          "एक नई कंपाइलर प्रोग्रामिंग भाषा लिखना।",
          "भौतिक सीपीयू कूलिंग बोर्ड डिजाइन करना।",
          "विकिपीडिया पर मुफ्त फाइल टेम्पलेट खोजना।"
        ],
        Hinglish: [
          "Local shops aur brands ke liye no-code automated pipelines aur lead generators set up karna.",
          "System assembly algorithms format script build karna.",
          "Hardware architecture graphics chips optimization tasks.",
          "Offline documents static rules translation setups."
        ]
      },
      correct: 0,
      explanation: {
        English: "Most businesses need simple, working automations (like email leads logged to sheets) rather than complex ML models.",
        Hindi: "कंपनियों को जटिल मॉडलों के बजाय साधारण ऑटोमेशन (जैसे लीड को शीट में सेव करना) की जरूरत होती है।",
        Hinglish: "Simple automation workflows clients ki manual problems solve karke immediate value provide karte hain."
      }
    }
  },
  {
    id: "EDU_030",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Building AI Businesses", Hindi: "एआई व्यवसाय बनाना", Hinglish: "Building AI Businesses" },
    title: {
      English: "AI for Content Creation",
      Hindi: "सामग्री निर्माण के लिए एआई",
      Hinglish: "AI for Content Creation"
    },
    summary: {
      English: "Use AI to script, generate visuals, and edit high-quality media content.",
      Hindi: "स्क्रिप्ट लिखने, चित्र बनाने और वीडियो संपादित करने के लिए एआई का उपयोग करें।",
      Hinglish: "AI tools use karke scripts, visuals, background music aur reels automatic generate karein."
    },
    explanation: {
      English: "AI speeds up content creation. You write a script idea in ChatGPT, generate thumbnail options in Midjourney, clone your voice in ElevenLabs, and render video assets. This workflow converts ideas into high-quality social posts in minutes.",
      Hindi: "एआई सामग्री निर्माण को तेज करता है। चैटजीपीटी में स्क्रिप्ट लिखें, मिडजर्नी में थंबनेल बनाएं, इलेवनलैब्स में अपनी आवाज क्लोन करें और वीडियो बनाएं।",
      Hinglish: "AI content creation speed up karta hai. ChatGPT se video script design, Midjourney se graphics aur high quality thumb, ElevenLabs se clone audio, aur templates chain karke detailed reels prepare karein."
    },
    examples: {
      English: ["Generating YouTube video script templates", "Creating Instagram graphic templates", "Producing background sounds with Suno"],
      Hindi: ["यूट्यूब वीडियो स्क्रिप्ट टेम्पलेट बनाना", ["इंस्टाग्राम ग्राफिक टेम्पलेट बनाना"], ["सूनो के साथ पृष्ठभूमि ध्वनियां बनाना"]],
      Hinglish: ["YouTube educational video outlines", "Instagram aesthetic post layout options", "Suno background tracks generation"]
    },
    keyConcepts: {
      English: ["Prompt context tone alignment", "Consistent visual elements", "Voice synthesis modulations"],
      Hindi: ["प्रॉम्प्ट संदर्भ और टोन संरेखण", "सुसंगत विजुअल तत्व", "आवाज संश्लेषण और मॉडुलन"],
      Hinglish: ["Storyboarding guidelines", "Consistent character graphics features", "Voiceover cloning outputs"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI content creation replaces human editing and storytelling entirely.",
        reality: "AI content feels robotic without human correction, unique stories, and emotional touch."
      },
      Hindi: {
        myth: "एआई सामग्री निर्माण मानव संपादन और कहानी सुनाने को पूरी तरह से बदल देता है।",
        reality: "इंसानी सुधार और भावनात्मक स्पर्श के बिना एआई सामग्री नीरस और रोबोटिक लगती है।"
      },
      Hinglish: {
        myth: "AI content direct copy paste karne se channel monetize ho jayega aur viewer base banega.",
        reality: "Zero human curation ke bina generated content robotic sound karta hai, organic edit essential hai."
      }
    },
    remember: {
      English: "Use AI for the speed, but keep human touch for the storytelling.",
      Hindi: "तेजी से काम करने के लिए एआई का उपयोग करें, लेकिन कहानी में मानवीय स्पर्श बनाए रखें।",
      Hinglish: "AI speed framework use karein aur editing emotional connection human hand me rakhein."
    },
    checkpoint: {
      question: {
        English: "What makes AI-generated social content truly successful?",
        Hindi: "एआई-जनित सोशल मीडिया सामग्री को वास्तव में क्या सफल बनाता है?",
        Hinglish: "AI-generated content me top reach kaise aati hai?"
      },
      options: {
        English: [
          "Human curation, unique editing, and personal story inputs.",
          "Uploading raw AI files without editing.",
          "Generating content only in binary format.",
          "Using multiple monitors to publish texts."
        ],
        Hindi: [
          "मानवीय क्यूरेशन, अनूठा संपादन और व्यक्तिगत कहानी इनपुट।",
          "बिना संपादन के कच्चे एआई फाइलों को अपलोड करना।",
          "केवल बाइनरी प्रारूप में सामग्री उत्पन्न करना।",
          "ग्रंथों को प्रकाशित करने के लिए कई मॉनीटरों का उपयोग करना।"
        ],
        Hinglish: [
          "Human editing, specific value add, aur creative story inputs blend karna.",
          "AI raw outputs bina changes direct public post karna.",
          "Simple system metrics rules text format configuration.",
          "Server configuration settings bandwidth updates."
        ]
      },
      correct: 0,
      explanation: {
        English: "Audience retention relies on emotion and value, which models cannot simulate without human direction.",
        Hindi: "दर्शक जुड़ाव के लिए मानवीय दृष्टिकोण आवश्यक है, जिसे एआई अकेले हासिल नहीं कर सकता।",
        Hinglish: "Curation aur unique storytelling inputs hi dynamic reach and views ensure karte hain."
      }
    }
  },
  {
    id: "EDU_031",
    difficulty: "Intermediate",
    time: "1 min",
    prerequisite: { English: "Using AI for Content Creation", Hindi: "सामग्री निर्माण के लिए एआई", Hinglish: "Using AI for Content Creation" },
    title: {
      English: "AI for Development",
      Hindi: "सॉफ्टवेयर विकास के लिए एआई",
      Hinglish: "AI for Development"
    },
    summary: {
      English: "Use AI codegen tools to write boilerplate, debug errors, and understand scripts.",
      Hindi: "कोड लिखने, एरर्स को ठीक करने और प्रोग्राम को समझने के लिए एआई का उपयोग करें।",
      Hinglish: "AI code editors (Cursor/Copilot) use karke templates autogenerate aur errors debug karein."
    },
    explanation: {
      English: "AI makes coding fast. Instead of searching forums for bugs, you paste errors into AI. Coding assistants (like Cursor, Github Copilot, or ChatGPT) write boilerplate functions, generate test scripts, explain complex algorithms, and solve syntax errors instantly.",
      Hindi: "एआई कोडिंग को बेहद तेज बनाता है। बग्स के लिए ऑनलाइन खोजने के बजाय, गलतियों को एआई में पेस्ट करें। कोडिंग सहायक (जैसे Cursor या Copilot) तुरंत कोड लिखते हैं और सिंटैक्स की गलतियों को ठीक करते हैं।",
      Hinglish: "AI programming ko fast karta hai. Forums par bugs search karne ke bajay errors context AI chat me paste karein. Code assistants (Cursor, Copilot) boilerplate structures automatic generate karte hain aur syntax format fix karte hain."
    },
    examples: {
      English: ["Autogenerating database connection code", "Debugging syntax errors from output logs", "Explaining complex script files"],
      Hindi: ["डेटाबेस कनेक्शन कोड स्वतः लिखना", ["लॉग फ़ाइलों से सिंटैक्स एरर ठीक करना"], ["कठिन प्रोग्राम फाइलों को समझना"]],
      Hinglish: ["Auto database config connection code", "Debugging JavaScript exceptions", "Explaining python loop functions"]
    },
    keyConcepts: {
      English: ["Boilerplate script generations", "Code refactoring principles", "Static analysis error debugging"],
      Hindi: ["बॉयलरप्लेट स्क्रिप्ट जनरेशन", "कोड रिफैक्टरिंग सिद्धांत", "सिंटैक्स एरर डिबगिंग"],
      Hinglish: ["Autogenerating boilerplate blocks", "Refactoring code paths", "Error trace logs inspections"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI will replace human developers completely next year.",
        reality: "AI assists with coding syntax, but humans must design system architecture and logic bounds."
      },
      Hindi: {
        myth: "एआई अगले साल मानव डेवलपर्स को पूरी तरह से हटा देगा।",
        reality: "एआई कोडिंग में मदद करता है, लेकिन सिस्टम डिजाइन और तर्क तो इंसानों को ही बनाना होगा।"
      },
      Hinglish: {
        myth: "AI engineers ki job khatam karke khud advanced architecture software design karega.",
        reality: "AI syntax helper hai. System designs, database logic aur final deployment human control me hi rehta hai."
      }
    },
    remember: {
      English: "AI is a fast junior programmer. You are the architect who approves code.",
      Hindi: "एआई एक तेज जूनियर प्रोग्रामर है। आप वह मुख्य आर्किटेक्ट हैं जो कोड को मंजूरी देते हैं।",
      Hinglish: "AI aapka fast junior developer hai, architect aur logic decision head aap hain."
    },
    checkpoint: {
      question: {
        English: "How does AI coding assistants accelerate development work?",
        Hindi: "एआई कोडिंग सहायक विकास कार्यों को कैसे गति प्रदान करते हैं?",
        Hinglish: "AI coding tools dev time kaise save karte hain?"
      },
      options: {
        English: [
          "By generating boilerplate functions and explaining syntax errors.",
          "By running local systems without electricity.",
          "By hosting cloud databases for free.",
          "By deleting bad code files automatically."
        ],
        Hindi: [
          "बॉयलरप्लेट फ़ंक्शन बनाकर और सिंटैक्स एरर को समझाकर।",
          "बिना बिजली के स्थानीय सिस्टम चलाकर।",
          "क्लाउड डेटाबेस को मुफ्त में होस्ट करके।",
          "खराब कोड फ़ाइलों को स्वचालित रूप से हटाकर।"
        ],
        Hinglish: [
          "Boilerplate code functions autogenerate karke aur errors explanation/fix dikhakar.",
          "System hardware compiler bypass settings configurations.",
          "Database connection limits configurations bypass settings.",
          "Offline file packages removal check loops."
        ]
      },
      correct: 0,
      explanation: {
        English: "AI autocomplete removes repetitive typing tasks and matches patterns in error logs.",
        Hindi: "एआई कोडिंग टूल बार-बार टाइप करने का काम कम करते हैं और एरर लॉग्स को जल्दी ठीक करते हैं।",
        Hinglish: "Syntax creation aur log trace checking time reduce karna codegen ka definition hai."
      }
    }
  },
  {
    id: "EDU_032",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Using AI for Software Development", Hindi: "सॉफ्टवेयर विकास के लिए एआई", Hinglish: "Using AI for Software Development" },
    title: {
      English: "AI for Education",
      Hindi: "शिक्षा के लिए एआई",
      Hinglish: "AI for Education"
    },
    summary: {
      English: "Use AI as a personalized tutor to explain concepts, practice, and prepare notes.",
      Hindi: "कॉन्सेप्ट्स समझने, अभ्यास करने और नोट्स बनाने के लिए एआई को पर्सनल ट्यूटर बनाएं।",
      Hinglish: "AI ko custom teacher banayein jo concepts ko easy analogies se samjhaye."
    },
    explanation: {
      English: "AI makes learning personal. If a textbook explanation is confusing, you can ask AI: 'Explain this concept like I am 10 years old using soccer analogies'. You can generate practice test quizzes, study notes, and get step-by-step math help anytime.",
      Hindi: "एआई पढ़ाई को व्यक्तिगत बनाता है। यदि कोई विषय कठिन लगे, तो एआई से कहें: 'मुझे यह विषय 10 साल के बच्चे की तरह उदाहरण देकर समझाओ।' यह अभ्यास क्विज़ भी बना सकता है।",
      Hinglish: "AI personalized learning tutor hai. Agar textbook explanation difficult lagta hai, toh write karein: 'Explain this like I'm 10 years old with cricket analogies'. Aap study worksheets, practice quizzes, aur notes instantly bana sakte hain."
    },
    examples: {
      English: ["Asking for real-world science analogies", "Generating custom exam practice tests", "Structuring study notes schedules"],
      Hindi: ["विज्ञान के सिद्धांतों के वास्तविक उदाहरण मांगना", ["कस्टम परीक्षा अभ्यास टेस्ट बनाना"], ["अध्ययन नोट्स की समय सारिणी तैयार करना"]],
      Hinglish: ["Explaining complex math using sports analogies", "Creating chapter review questions tests", "Structuring study guides lists"]
    },
    keyConcepts: {
      English: ["Socratic learning method prompts", "Concept translation checks", "Personalized study roadmaps"],
      Hindi: ["सुकराती शिक्षण पद्धति प्रॉम्प्ट (Socratic teaching)", "अवधारणाओं का अनुवाद", "व्यक्तिगत अध्ययन योजनाएं"],
      Hinglish: ["Socratic interactive queries", "Analogy mapping techniques", "Stepwise syllabus plan designs"]
    },
    myth_vs_reality: {
      English: {
        myth: "Using AI for study is cheating and will make students lazy.",
        reality: "Using AI to copy direct answers is cheating. Using it to explain steps increases understanding."
      },
      Hindi: {
        myth: "पढ़ाई के लिए एआई का उपयोग करना धोखाधड़ी है और इससे छात्र आलसी बनेंगे।",
        reality: "सीधे उत्तर कॉपी करना गलत है, लेकिन कठिन विषयों को समझने के लिए एआई का उपयोग ज्ञान बढ़ाता है।"
      },
      Hinglish: {
        myth: "AI use karne se memory weak ho jayegi aur learning zero hogi.",
        reality: "Homework direct copy karna cheating hai. Par steps aur equations check karke doubts clear karna active learning hai."
      }
    },
    remember: {
      English: "Use AI to clarify your doubts and create self-test study quizzes.",
      Hindi: "अपनी शंकाओं को दूर करने और स्वयं-परीक्षण क्विज़ बनाने के लिए एआई का उपयोग करें।",
      Hinglish: "Doubts clear karne aur test sheets ready karne ke liye AI use karein."
    },
    checkpoint: {
      question: {
        English: "What is the best way to utilize AI to learn a complex topic?",
        Hindi: "कठिन विषय को सीखने के लिए एआई का उपयोग करने का सबसे अच्छा तरीका क्या है?",
        Hinglish: "Difficult topic seekhne ke liye AI ka sahi use kya hai?"
      },
      options: {
        English: [
          "Ask AI to explain it step-by-step with real-world analogies, then generate a test.",
          "Copy and paste direct answers without reading them.",
          "Write instructions in binary format codes.",
          "Ask the server to delete the class syllabus files."
        ],
        Hindi: [
          "एआई से वास्तविक उदाहरणों के साथ कदम-दर-कदम समझाने के लिए कहें, फिर एक टेस्ट बनाएं।",
          "बिना पढ़े सीधे उत्तर कॉपी-पेस्ट करना।",
          "बाइनरी प्रारूप कोड में निर्देश लिखना।",
          "सर्वर से कक्षा पाठ्यक्रम फ़ाइलों को हटाने के लिए कहना।"
        ],
        Hinglish: [
          "AI ko step-by-step explain karne ke liye kahein analogies ke sath, and self-test generate karein.",
          "Direct answers Bina samajhe copy-paste details.",
          "Static binary programs rules code run checks.",
          "Internet connection limits restart setups."
        ]
      },
      correct: 0,
      explanation: {
        English: "Analogies link new complex concepts to familiar visual frameworks, boosting retention.",
        Hindi: "उदाहरण नए कठिन विषयों को परिचित चीजों से जोड़ते हैं, जिससे समझना आसान हो जाता है।",
        Hinglish: "Concept break karke dynamic analogies maps construct karna best study methodology hai."
      }
    }
  },
  {
    id: "EDU_033",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Using AI for Education", Hindi: "शिक्षा के लिए एआई", Hinglish: "Using AI for Education" },
    title: {
      English: "AI for Research",
      Hindi: "अनुसंधान के लिए एआई (AI for Research)",
      Hinglish: "AI for Research"
    },
    summary: {
      English: "Use AI to find academic papers, summarize long articles, and extract key points.",
      Hindi: "शोध पत्र खोजने, लंबे लेखों का सारांश बनाने और मुख्य बिंदु निकालने के लिए एआई का उपयोग करें।",
      Hinglish: "Research tools (Perplexity/Consensus) se articles study summaries aur references verify karein."
    },
    explanation: {
      English: "AI speeds up academic research. Instead of reading hundred-page PDFs to find a single statistic, research engines (like Perplexity or Consensus) search databases, compile relevant paragraphs, and output detailed summaries with academic citations.",
      Hindi: "एआई शोध कार्यों को आसान बनाता है। किसी जानकारी के लिए सौ पन्नों की पीडीएफ पढ़ने के बजाय, एआई टूल्स (जैसे Perplexity) डेटाबेस खोजते हैं और वैज्ञानिक संदर्भों (Citations) के साथ सारांश प्रदान करते हैं।",
      Hinglish: "AI research fast karta hai. 100-page scientific PDF read karne ke bajay Research engines (Perplexity, Consensus) databases sweep karte hain aur sources (citations) ke sath clean bullet summaries print karte hain."
    },
    examples: {
      English: ["Finding medical trials summaries with citations", "Summarizing thesis papers PDF files", "Extracting key figures from market charts"],
      Hindi: ["वैज्ञानिक संदर्भों के साथ चिकित्सा परीक्षणों के सारांश खोजना", ["शोध पत्रों (Thesis) की पीडीएफ का सारांश बनाना"], ["बाज़ार चार्ट से मुख्य आंकड़े निकालना"]],
      Hinglish: ["Finding target scientific paper details", "PDF book thesis chapter summaries", "Extracting dataset statistics tables"]
    },
    keyConcepts: {
      English: ["Verified citations tracking", "PDF document parsing details", "Querying academic databases"],
      Hindi: ["सत्यापित संदर्भ ट्रैकिंग (Citations tracking)", "पीडीएफ दस्तावेज़ पार्सिंग", "शैक्षणिक डेटाबेस खोजना"],
      Hinglish: ["Citations references checking", "PDF text extraction parsing", "Semantic academic search engines"]
    },
    myth_vs_reality: {
      English: {
        myth: "Standard ChatGPT always outputs true scientific facts with real page URLs.",
        reality: "Normal LLMs can hallucinate (fabricate) fake paper citations if they don't use web-connected search models."
      },
      Hindi: {
        myth: "सामान्य चैटजीपीटी हमेशा वास्तविक पृष्ठ यूआरएल के साथ सटीक वैज्ञानिक तथ्य देता है।",
        reality: "इंटरनेट से न जुड़े होने पर सामान्य मॉडल अक्सर मनगढ़ंत (Hallucinate) झूठे संदर्भ बना देते हैं।"
      },
      Hinglish: {
        myth: "ChatGPT har paper reference sahi output deta hai.",
        reality: "Simple models fake citations/links fabricate (hallucinate) kar dete hain. Research ke liye Perplexity ya Consensus use karein."
      }
    },
    remember: {
      English: "Always verify AI citations against the original source papers to avoid mistakes.",
      Hindi: "गलतियों से बचने के लिए हमेशा एआई द्वारा दिए गए संदर्भों की मूल दस्तावेज़ से जाँच करें।",
      Hinglish: "Model citations code check karke actual PDF sources verify karna mandatory research step hai."
    },
    checkpoint: {
      question: {
        English: "What is a 'hallucination' in AI research terms?",
        Hindi: "एआई अनुसंधान के संदर्भ में 'मतिभ्रम' (Hallucination) क्या है?",
        Hinglish: "AI term me 'Hallucination' ka kya matlab hota hai?"
      },
      options: {
        English: [
          "When the AI generates realistic-sounding but completely fake information/citations.",
          "When the computer screens turn off automatically.",
          "When the system memory storage size increases.",
          "When the model runs on offline hardware components."
        ],
        Hindi: [
          "जब एआई यथार्थवादी दिखने वाली लेकिन पूरी तरह से नकली जानकारी/संदर्भ उत्पन्न करता है।",
          "जब कंप्यूटर स्क्रीन अपने आप बंद हो जाती है।",
          "जब सिस्टम मेमोरी स्टोरेज का आकार बढ़ जाता है।",
          "जब मॉडल ऑफ़लाइन हार्डवेयर घटकों पर चलता है।"
        ],
        Hinglish: [
          "Jab model mathematically confident look me false/fake facts and citations generate karta hai.",
          "System hardware error screens display checks.",
          "Internet connection limits configurations blocks.",
          "Database query standard metrics tables configurations."
        ]
      },
      correct: 0,
      explanation: {
        English: "Hallucinations happen because LLMs select tokens based on syntax probability, not verified databases.",
        Hindi: "मतिभ्रम (Hallucination) तब होता है जब मॉडल तथ्यों की पुष्टि किए बिना केवल संभावी शब्दों को जोड़ देता है।",
        Hinglish: "Probability updates rules check factual verification check miss hone par hallucination hota hai."
      }
    }
  },
  {
    id: "EDU_034",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Using AI for Research", Hindi: "अनुसंधान के लिए एआई", Hinglish: "Using AI for Research" },
    title: {
      English: "AI for Marketing",
      Hindi: "विपणन के लिए एआई (AI for Marketing)",
      Hinglish: "AI for Marketing"
    },
    summary: {
      English: "Create marketing copies, optimize ads, and schedule social campaigns using AI.",
      Hindi: "विपणन कॉपियां (Copywriting) लिखने, विज्ञापनों को अनुकूलित करने और अभियान सेट करने में एआई सहायक है।",
      Hinglish: "AI se marketing copies, ad titles, target hashtags aur product campaigns fast prepare karein."
    },
    explanation: {
      English: "AI automates business marketing. You can write highly engaging ad copies for social platforms, research keywords for search engine rankings (SEO), draft customer surveys, and design personalized email newsletters tailored to specific customer profiles instantly.",
      Hindi: "एआई व्यापार विपणन को आसान बनाता है। आप सोशल मीडिया के लिए आकर्षक विज्ञापन लिख सकते हैं, सर्च इंजन रैंकिंग (SEO) के लिए कीवर्ड खोज सकते हैं और ईमेल न्यूज़लेटर तैयार कर सकते हैं।",
      Hinglish: "AI marketing workflows fast karta hai. Aap highly engaging social media ads, landing page copies, aur targeted keywords (SEO) design kar sakte hain. AI parameters consumer profile segment check karke appropriate tone generate karte hain."
    },
    examples: {
      English: ["Drafting social media post caption templates", "Finding target keywords for SEO optimization", "Writing marketing email layouts"],
      Hindi: ["सोशल मीडिया पोस्ट के कैप्शन टेम्पलेट बनाना", ["एसईओ अनुकूलन के लिए कीवर्ड खोजना"], ["मार्केटिंग ईमेल के लेआउट लिखना"]],
      Hinglish: ["Instagram caption generation tools", "SEO optimization keyword search", "Email product launch templates generation"]
    },
    keyConcepts: {
      English: ["SEO metadata configurations", "Engaging copywriting formulas", "Customer profile classification checks"],
      Hindi: ["एसईओ मेटाडेटा कॉन्फ़िगरेशन", "आकर्षक कॉपीराइटिंग सूत्र", "ग्राहक प्रोफाइल वर्गीकरण"],
      Hinglish: ["SEO metadata tag structures", "AIDA copywriting structure prompts", "Consumer profiling constraints"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI knows exactly which ad text will generate 100% sales.",
        reality: "AI can only draft variations. You must perform A/B testing to verify what customers click."
      },
      Hindi: {
        myth: "एआई को बिल्कुल पता होता है कि कौन सा विज्ञापन लिखने से 100% बिक्री होगी।",
        reality: "एआई केवल विज्ञापन के विकल्प दे सकता है। ग्राहक किसे पसंद करते हैं, यह आपको परखना होगा।"
      },
      Hinglish: {
        myth: "AI marketing text se 100% customer sales conversion guarantee ho jati hai.",
        reality: "AI options generate karta hai. Market reaction test (A/B testing) check karna operator ka job hai."
      }
    },
    remember: {
      English: "Use AIDA framework prompts to build highly engaging marketing copies.",
      Hindi: "आकर्षक विज्ञापन लिखने के लिए एआई प्रॉम्प्ट में AIDA फ्रेमवर्क का उपयोग करें।",
      Hinglish: "Customer attention hold karne ke liye AIDA framework prompts utilize karein."
    },
    checkpoint: {
      question: {
        English: "What is AIDA in marketing prompt engineering terms?",
        Hindi: "विपणन प्रॉम्प्ट इंजीनियरिंग में AIDA का क्या अर्थ है?",
        Hinglish: "Marketing prompts me AIDA framework ka kya matlab hota hai?"
      },
      options: {
        English: [
          "Attention, Interest, Desire, Action.",
          "Automatic Image Data Assembly.",
          "Algorithm Integration Directory Access.",
          "Active Database Analytics Gateway."
        ],
        Hindi: [
          "अटेंशन, इंटरेस्ट, डिज़ायर, एक्शन (Attention, Interest, Desire, Action)।",
          "ऑटोमैटिक इमेज डेटा असेंबली (Automatic Image Data Assembly)।",
          "एल्गोरिदम इंटीग्रेशन डायरेक्टरी एक्सेस (Algorithm Integration Directory Access)।",
          "एक्टिव डेटाबेस एनालिटिक्स गेटवे (Active Database Analytics Gateway)।"
        ],
        Hinglish: [
          "Attention, Interest, Desire, Action.",
          "Array Indexing Data Automation.",
          "Address Integration Device Adapter.",
          "Analytical Document Access Layer."
        ]
      },
      correct: 0,
      explanation: {
        English: "AIDA is the standard psychological conversion framework guiding copy structure patterns.",
        Hindi: "AIDA विज्ञापन कॉपियों को व्यवस्थित करने का एक मनोवैज्ञानिक सूत्र है जो ध्यान आकर्षित करता है।",
        Hinglish: "AIDA sequence model prompts ko effective copy details generate karne me guide karta hai."
      }
    }
  },
  {
    id: "EDU_035",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Using AI for Marketing", Hindi: "विपणन के लिए एआई", Hinglish: "Using AI for Marketing" },
    title: {
      English: "AI for Startups",
      Hindi: "स्टार्टअप के लिए एआई (AI for Startups)",
      Hinglish: "AI for Startups"
    },
    summary: {
      English: "Build mockups, write business plans, and pitch ideas to investors using AI.",
      Hindi: "स्टार्टअप के लिए बिजनेस प्लान लिखने, थंबनेल और पिच-डेक बनाने में एआई का उपयोग करें।",
      Hinglish: "AI se startup pitch decks, target financial plans aur business ideas review validate karein."
    },
    explanation: {
      English: "AI acts as a free co-founder. You can write detailed business models, run financial projections, design product interface mockups, refine pitch deck presentations, and draft legal agreements templates in hours instead of spending weeks.",
      Hindi: "एआई एक मानद सह-संस्थापक (Co-founder) की तरह काम करता है। आप बिजनेस मॉडल लिख सकते हैं, वित्तीय अनुमान लगा सकते हैं और पिच डेक तैयार कर सकते हैं।",
      Hinglish: "AI startup co-founder ki tarah work kar sakta hai. Aap startup business plan outlines, financial projection metrics calculations, MVP product layouts, aur seed pitch decks drafts hours me ready kar sakte hain."
    },
    examples: {
      English: ["Drafting lean startup canvas models", "Structuring financial projections charts", "Generating prototype UI mockups"],
      Hindi: ["लीन स्टार्टअप कैनवास मॉडल तैयार करना", ["वित्तीय अनुमानों के चार्ट बनाना"], ["प्रोटोटाइप यूजर इंटरफेस के मॉडल बनाना"]],
      Hinglish: ["Writing Lean Startup Canvas sheets", "Auto-generating cost calculation tables", "Figma UI prompt design guides"]
    },
    keyConcepts: {
      English: ["Business model parameters", "MVP prototyping metrics", "Pitch deck design layouts"],
      Hindi: ["बिजनेस मॉडल के पैरामीटर", "एमवीपी प्रोटोटाइप मेट्रिक्स", "पिच डेक डिजाइन लेआउट"],
      Hinglish: ["Lean Canvas business structure", "MVP prototype limits", "Pitch deck guidelines formulas"]
    },
    myth_vs_reality: {
      English: {
        myth: "AI startup plans will guarantee seed funding from investors.",
        reality: "Investors look for real market traction, customer feedback, and unique execution, not just AI-generated PDFs."
      },
      Hindi: {
        myth: "एआई से बनी व्यावसायिक योजनाएं सीधे निवेशकों से फंडिंग दिला देंगी।",
        reality: "निवेशक बाजार की मांग, ग्राहकों की प्रतिक्रिया और आपके वास्तविक अनुभव को देखते हैं, न कि केवल पीडीएफ।"
      },
      Hinglish: {
        myth: "AI se generated pitch deck aur plans dekhkar VC funding confirm ho jati hai.",
        reality: "VCs actual market sales growth aur execution depth check karte hain, simple AI texts nahi."
      }
    },
    remember: {
      English: "Use AI to speed up documentation, but validate product demand with real customers.",
      Hindi: "दस्तावेज़ बनाने के लिए एआई का उपयोग करें, लेकिन उत्पाद की मांग की जांच वास्तविक ग्राहकों से करें।",
      Hinglish: "AI se documents fast prepare karein, par product validation field check se hi karein."
    },
    checkpoint: {
      question: {
        English: "What represents an MVP in startup launching terms?",
        Hindi: "स्टार्टअप लॉन्च करने के संदर्भ में MVP का क्या अर्थ है?",
        Hinglish: "Startup business me 'MVP' ka matlab kya hota hai?"
      },
      options: {
        English: [
          "Minimum Viable Product.",
          "Most Valuable Processor.",
          "Maximum Vector Path.",
          "Modular Validated Pipeline."
        ],
        Hindi: [
          "न्यूनतम व्यवहार्य उत्पाद (Minimum Viable Product)।",
          "सर्वाधिक मूल्यवान प्रोसेसर (Most Valuable Processor)।",
          "अधिकतम वेक्टर पथ (Maximum Vector Path)।",
          "मॉड्यूलर सत्यापित पाइपलाइन (Modular Validated Pipeline)।"
        ],
        Hinglish: [
          "Minimum Viable Product.",
          "Model Variable Parameters.",
          "Market Value Projection.",
          "Mobile Verified Package."
        ]
      },
      correct: 0,
      explanation: {
        English: "An MVP is the simplest product version built to test demand with early customers.",
        Hindi: "एमवीपी (MVP) उत्पाद का वह सबसे बुनियादी रूप है जो ग्राहकों की मांग को परखने के लिए बनाया जाता है।",
        Hinglish: "Customer response check karne ke liye banaya gaya basic features setup MVP hai."
      }
    }
  },
  {
    id: "EDU_036",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Using AI for Startups", Hindi: "स्टार्टअप के लिए एआई", Hinglish: "Using AI for Startups" },
    title: {
      English: "Future of AI",
      Hindi: "एआई का भविष्य (Future of AI)",
      Hinglish: "Future of AI"
    },
    summary: {
      English: "Explore Artificial General Intelligence (AGI) and future multi-agent models.",
      Hindi: "आर्टिफिशियल जनरल इंटेलिजेंस (AGI) और बहु-एजेंट प्रणालियों के भविष्य को समझें।",
      Hinglish: "AGI (Artificial General Intelligence) aur humanoid multi-agent networks ke future ko samjhenge."
    },
    explanation: {
      English: "The ultimate goal of AI research is AGI (Artificial General Intelligence) – AI that can perform any intellectual task a human can do. The future shifts from simple chat boxes to fleets of coordinated AI Agents handling complex businesses automatically.",
      Hindi: "एआई अनुसंधान का अंतिम लक्ष्य AGI है—ऐसा एआई जो इंसानों की तरह हर मानसिक कार्य कर सके। भविष्य चैटबॉट से हटकर एक साथ काम करने वाले सैकड़ों स्वायत्त एजेंटों का है।",
      Hinglish: "AI ka next milestone AGI (Artificial General Intelligence) hai - yaani aisi machines jo human dimaag ki tarah har task perform kar sakein. Future multi-agent setups ka hai jo background systems automatically handle karenge."
    },
    examples: {
      English: ["AGI research protocols from OpenAI", "Autonomous multi-agent business fleets", "Humanoid robots handling physical work"],
      Hindi: ["ओपनएआई के एजीआई अनुसंधान प्रोटोकॉल", "स्वायत्त मल्टी-एजेंट व्यापार प्रणालियां", "शारीरिक काम संभालते ह्यूमनाइड रोबोट"],
      Hinglish: ["AGI milestones research updates", "Coordinated multi-agent networks running tasks", "Humanoid robots running physical labor tasks"]
    },
    keyConcepts: {
      English: ["AGI (General Intelligence) milestones", "Autonomous swarm agent fleets", "Human-level reason parameters"],
      Hindi: ["एजीआई (AGI) के महत्वपूर्ण चरण", "स्वायत्त झुंड एजेंट (Swarm agents)", "मानव-स्तरीय तर्क प्रणाली"],
      Hinglish: ["AGI intelligence levels", "Swarm intelligence agent networks", "Advanced reasoning networks"]
    },
    myth_vs_reality: {
      English: {
        myth: "AGI will be fully completed and control all countries in 2026.",
        reality: "AGI requires major scientific breakthroughs in logic, planning, and memory; it remains years away."
      },
      Hindi: {
        myth: "एजीआई 2026 तक पूरी तरह से बन जाएगा और सभी देशों को नियंत्रित करेगा।",
        reality: "एजीआई के लिए अभी तर्क और योजना निर्माण के क्षेत्र में बड़े आविष्कारों की जरूरत है।"
      },
      Hinglish: {
        myth: "AGI agle saal hi ban jayega aur robot logo ko control karenge.",
        reality: "AGI ko model updates aur algorithms levels par new discoveries chahiye, isme time lagega."
      }
    },
    remember: {
      English: "AI is moving from conversational chat boxes to coordinated automated agent fleets.",
      Hindi: "एआई अब चैट विंडो से निकलकर स्वायत्त रूप से काम करने वाले नेटवर्क में बदल रहा है।",
      Hinglish: "Future static chat bots ka nahi balki smart agent fleets ka hai."
    },
    checkpoint: {
      question: {
        English: "What separates Artificial General Intelligence (AGI) from narrow AI?",
        Hindi: "आर्टिफिशियल जनरल इंटेलिजेंस (AGI) को संकीर्ण एआई (Narrow AI) से क्या अलग करता है?",
        Hinglish: "AGI (General Intelligence) Narrow AI se kaise different hai?"
      },
      options: {
        English: [
          "AGI can generalize learning to perform any intellectual task a human can do.",
          "AGI only works on higher internet connection speeds.",
          "AGI is coded inside offline text documents.",
          "AGI only does one job like chess or spam filter."
        ],
        Hindi: [
          "एजीआई मानव द्वारा किए जा सकने वाले किसी भी बौद्धिक कार्य को करने के लिए सीखने को सामान्य बना सकता है।",
          "एजीआई केवल उच्च इंटरनेट कनेक्शन गति पर काम करता है।",
          "एजीआई ऑफ़लाइन टेक्स्ट दस्तावेजों के अंदर कोडित है।",
          "एजीआई शतरंज या स्पैम फ़िल्टर जैसा केवल एक ही काम करता है।"
        ],
        Hinglish: [
          "AGI bina specialized data training ke har field ke task human capability level par adapt kar sakta hai.",
          "AGI network standard offline files bypass settings.",
          "AGI simple single check calculations run loops execute.",
          "AGI coordinate values only monitor systems interface."
        ]
      },
      correct: 0,
      explanation: {
        English: "Narrow AI excels only at single tasks (like translation), whereas AGI targets cross-domain logic generalization.",
        Hindi: "वर्तमान एआई केवल एक काम (जैसे अनुवाद) में माहिर है, जबकि एजीआई सभी क्षेत्रों में बुद्धिमान होगा।",
        Hinglish: "Cross-domain logic capability hi AGI target ka main differentiator hai."
      }
    }
  },
  {
    id: "EDU_037",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Future of Artificial Intelligence", Hindi: "एआई का भविष्य", Hinglish: "Future of Artificial Intelligence" },
    title: {
      English: "Limitations of AI",
      Hindi: "एआई की सीमाएं (Limitations of AI)",
      Hinglish: "Limitations of AI"
    },
    summary: {
      English: "AI lacks real-time facts, hallucinates fake data, and requires massive energy.",
      Hindi: "एआई में वास्तविक समय की समझ की कमी होती है, मतिभ्रम (Hallucination) होता है और भारी ऊर्जा खर्च होती है।",
      Hinglish: "AI bina internet access real-time status nahi batata, fake text build karta hai aur computation heavy hai."
    },
    explanation: {
      English: "AI is not perfect. Main limitations: 1) Hallucinations (AI creates false details with confidence). 2) Knowledge cutoff (offline training limits recent knowledge). 3) High compute cost (powering large GPU models requires massive electricity, leading to high bills).",
      Hindi: "एआई त्रुटिहीन नहीं है। सीमाएं: 1) मतिभ्रम (झूठे तथ्य बनाना)। 2) ज्ञान सीमा (ट्रेनिंग की तारीख के बाद की घटनाएं न जानना)। 3) भारी ऊर्जा खर्च (सर्वर चलाने के लिए बहुत बिजली लगती है)।",
      Hinglish: "AI ki limitations: 1) Hallucination (confident look me wrong answers banana). 2) Cut-off date (training time ke baad ka recent data na hona). 3) Cost & compute limitations (heavy servers running me massive power aur bills lagte hain)."
    },
    examples: {
      English: ["AI generating fake medical data references", "ChatGPT missing current events due to cutoff dates", "High billing charges for running complex APIs"],
      Hindi: ["एआई द्वारा नकली चिकित्सा डेटा संदर्भ बनाना", "कटऑफ तारीख के कारण चैटजीपीटी द्वारा हालिया घटनाओं को छोड़ना", "जटिल एपीआई चलाने के लिए उच्च बिलिंग शुल्क"],
      Hinglish: ["AI fabricating research source page links", "Model not knowing yesterday's matches statistics", "High API monthly bills for startup operations"]
    },
    keyConcepts: {
      English: ["Information hallucination patterns", "Model knowledge cutoff limits", "Computational resource scaling costs"],
      Hindi: ["सूचना मतिभ्रम पैटर्न (Hallucination)", "मॉडल ज्ञान कटऑफ सीमा", "कंप्यूटेशनल संसाधन लागत"],
      Hinglish: ["Hallucinations errors vectors", "Knowledge cutoff constraints", "API compute pricing tokens"]
    },
    myth_vs_reality: {
      English: {
        myth: "An AI system is a direct portal to absolute, verified truth.",
        reality: "AI calculates syntax patterns of words; it has no built-in database to verify if facts are true."
      },
      Hindi: {
        myth: "एआई प्रणाली अंतिम और 100% सत्यापित सत्य का स्रोत है।",
        reality: "एआई केवल वाक्यों के पैटर्न की गणना करता है; इसके पास सत्यता जांचने की शक्ति नहीं होती।"
      },
      Hinglish: {
        myth: "AI answers 100% correct verify hokar server se aate hain.",
        reality: "AI sirf words pattern matching calculations output deta hai, real truth validation zero hoti hai."
      }
    },
    remember: {
      English: "AI predicts what text sounds correct, not what fact is actually true.",
      Hindi: "एआई यह अनुमान लगाता है कि कौन सा पाठ सुनने में सही लगता है, न कि कौन सा तथ्य सच है।",
      Hinglish: "AI syntax verify karta hai, database facts check nahi karta."
    },
    checkpoint: {
      question: {
        English: "What represents a 'knowledge cutoff' limit in LLMs?",
        Hindi: "एलएलएम में 'ज्ञान कटऑफ' (Knowledge cutoff) सीमा क्या दर्शाती है?",
        Hinglish: "LLM me 'knowledge cutoff' ka exact meaning kya hota hai?"
      },
      options: {
        English: [
          "The limit representing the date when training data collection stopped.",
          "The limit on the maximum files download rates.",
          "The security code required to start server modules.",
          "The time required to log out of database networks."
        ],
        Hindi: [
          "वह सीमा जो उस तारीख को दर्शाती है जब प्रशिक्षण डेटा एकत्र करना बंद कर दिया गया था।",
          "अधिकतम फ़ाइल डाउनलोड दरों पर सीमा।",
          "सर्वर मॉड्यूल शुरू करने के लिए आवश्यक सुरक्षा कोड।",
          "डेटाबेस नेटवर्क से लॉग आउट करने के लिए आवश्यक समय।"
        ],
        Hinglish: [
          "Model ki training input data collect karne ki last date limit.",
          "System hardware coordinates speed parameter limits.",
          "Static compiler instructions standard formatting check.",
          "Offline folders backup sync limitations."
        ]
      },
      correct: 0,
      explanation: {
        English: "Models cannot predict events happening after training data collection cutoff unless connected to active search APIs.",
        Hindi: "मॉडल प्रशिक्षण की तारीख के बाद की घटनाओं का उत्तर तब तक नहीं दे सकते जब तक उन्हें सर्च एपीआई से न जोड़ा जाए।",
        Hinglish: "Training sets values cutoff date ke baad updates include nahi karte."
      }
    }
  },
  {
    id: "EDU_038",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Limitations of AI", Hindi: "एआई की सीमाएं", Hinglish: "Limitations of AI" },
    title: {
      English: "AI Ethics",
      Hindi: "एआई नैतिकता और जिम्मेदार उपयोग",
      Hinglish: "AI Ethics"
    },
    summary: {
      English: "Understand bias, avoid plagiarism, and prevent copyright leaks when using AI.",
      Hindi: "एआई का उपयोग करते समय पूर्वाग्रह (Bias), कॉपीराइट और जिम्मेदार उपयोग को समझें।",
      Hinglish: "AI biases ko avoid karein, copyright rules samjhein, aur private details leak na hone dein."
    },
    explanation: {
      English: "AI Ethics means using AI responsibly. AI is trained on human data, so it can repeat human biases and prejudices. Key ethical guidelines: 1) Protect privacy (never paste personal passwords or patient data). 2) Respect copyright (check licensing rules for AI generated art/code).",
      Hindi: "एआई नैतिकता का अर्थ है जिम्मेदारी से एआई का उपयोग करना। एआई मानवीय डेटा से सीखता है, इसलिए यह पूर्वाग्रह दोहरा सकता है। दिशानिर्देश: गोपनीयता की रक्षा करें और कॉपीराइट का सम्मान करें।",
      Hinglish: "AI Ethics ka matlab responsibility se technology use karna hai. AI human data se seekhta hai, isliye isme biases ho sakte hain. Rule: 1) Privacy check (medical/passwords content upload na karein). 2) IP & copyright standards follow karein."
    },
    examples: {
      English: ["Avoiding pasting company private source code into public chats", "Verifying bias in hiring recommendations systems", "Disclosing AI use in educational scripts"],
      Hindi: ["सार्वजनिक चैट में कंपनी के निजी कोड को पेस्ट करने से बचना", ["भर्ती प्रणालियों में पूर्वाग्रह की जाँच करना"], ["शैक्षणिक कार्यों में एआई उपयोग का खुलासा करना"]],
      Hinglish: ["Not uploading secure company codes to public APIs", "Checking recruitment model filters for gender biases", "Adding AI disclosure tag in blogs content"]
    },
    keyConcepts: {
      English: ["Data privacy protections", "Algorithmic bias patterns", "AI system transparency disclosures"],
      Hindi: ["डेटा गोपनीयता सुरक्षा", "एल्गोरिथम पूर्वाग्रह", "एआई प्रणालियों में पारदर्शिता प्रकटीकरण"],
      Hinglish: ["Secure API data protections", "Training bias corrections metrics", "Clear disclosure rules standards"]
    },
    myth_vs_reality: {
      English: {
        myth: "Whatever you type inside public AI chat window remains completely private.",
        reality: "Most free AI tools save chat history to retrain their models, meaning employees can review inputs."
      },
      Hindi: {
        myth: "सार्वजनिक एआई चैट में आप जो भी लिखते हैं, वह पूरी तरह से गुप्त रहता है।",
        reality: "अधिकांश मुफ्त एआई टूल्स मॉडल को प्रशिक्षित करने के लिए बातचीत का इतिहास सहेजते हैं।"
      },
      Hinglish: {
        myth: "AI chat me hum jo bhi text type karte hain, wo hamesha confidential rehta hai.",
        reality: "Free tools chat histories use karke models train karte hain, jisse human reviews ke chances hote hain."
      }
    },
    remember: {
      English: "Never paste passwords, private data, or confidential code into public AI chats.",
      Hindi: "सार्वजनिक एआई चैट में कभी भी पासवर्ड, निजी डेटा या गोपनीय कोड पेस्ट न करें।",
      Hinglish: "Private passwords ya database codes public chats me upload karna dangerous hai."
    },
    checkpoint: {
      question: {
        English: "Why should you avoid pasting confidential codes into free public AI chat applications?",
        Hindi: "आपको मुफ्त सार्वजनिक एआई चैट में गोपनीय कोड पेस्ट करने से क्यों बचना चाहिए?",
        Hinglish: "Free AI chat box me sensitive company data paste kyu nahi karna chahiye?"
      },
      options: {
        English: [
          "Because the data can be stored and used to retrain public models.",
          "Because the code file size limits will freeze browser frames.",
          "Because only binary files can be compiled globally.",
          "Because the computer storage partition formats automatically."
        ],
        Hindi: [
          "क्योंकि डेटा को संग्रहीत किया जा सकता है और सार्वजनिक मॉडल को प्रशिक्षित करने के लिए उपयोग किया जा सकता है।",
          "क्योंकि कोड फ़ाइल आकार सीमाएं ब्राउज़र फ़्रेम को फ्रीज कर देंगी।",
          "क्योंकि केवल बाइनरी फ़ाइलों को विश्व स्तर पर संकलित किया जा सकता है।",
          "क्योंकि कंप्यूटर स्टोरेज पार्टीशन अपने आप फॉर्मेट हो जाता है।"
        ],
        Hinglish: [
          "Kyunki upload kiya gaya context public dataset training sets me save kiya ja sakta hai.",
          "Isme background browser variables system error display checking checks.",
          "System hardware compiler restrictions blocks sync checks.",
          "Database connection limits configurations decrease logic."
        ]
      },
      correct: 0,
      explanation: {
        English: "API models terms of service often reserve the right to review inputs for reinforcement learning updates.",
        Hindi: "मुफ्त एआई सेवाओं की शर्तें स्पष्ट करती हैं कि वे इनपुट डेटा का उपयोग मॉडल सुधार के लिए कर सकते हैं।",
        Hinglish: "Chat logs input data collection models retraining me use hone ka threat rehta hai."
      }
    }
  },
  {
    id: "EDU_039",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "AI Ethics and Responsible Usage", Hindi: "एआई नैतिकता", Hinglish: "AI Ethics and Responsible Usage" },
    title: {
      English: "Career Opportunities",
      Hindi: "एआई में करियर के अवसर",
      Hinglish: "Career Opportunities in AI"
    },
    summary: {
      English: "Explore careers like Prompt Engineer, AI Consultant, or Integration Specialist.",
      Hindi: "प्रॉम्प्ट इंजीनियर, एआई सलाहकार या इंटीग्रेशन विशेषज्ञ जैसे करियर के अवसरों को जानें।",
      Hinglish: "AI domains me jobs explore karein: Prompt Engineer, AI automation specialist, ya SaaS consultant."
    },
    explanation: {
      English: "AI is creating new career paths. Key jobs: 1) Prompt Engineer (designing robust instruction templates). 2) AI Integration Specialist (connecting APIs with tools like Make/Zapier). 3) AI Consultant (helping small businesses automate manual tasks). No CS degree required.",
      Hindi: "एआई नए करियर के रास्ते बना रहा है। प्रमुख नौकरियां: 1) प्रॉम्प्ट इंजीनियर (टेम्पलेट डिजाइन करना)। 2) एआई इंटीग्रेशन विशेषज्ञ (मेक/ज़ेपियर से सिस्टम जोड़ना)। 3) एआई सलाहकार (व्यापार स्वचालन में मदद करना)।",
      Hinglish: "AI se high-paying career tracks open ho rahe hain: 1) Prompt Engineer (accurate structures write karna). 2) AI Automation Specialist (Zapier/Make se systems scale coordinate karna). 3) AI Business Consultant (clients ka manual tasks effort save karna)."
    },
    examples: {
      English: ["Working as a prompt designer in agencies", "Consulting for logistics companies to apply AI tools", "Building customized AI chat solutions for clients"],
      Hindi: ["एजेंसियों में प्रॉम्प्ट डिजाइनर के रूप में काम करना", "लॉजिस्टिक्स कंपनियों को एआई टूल्स के उपयोग की सलाह देना", "ग्राहकों के लिए कस्टम एआई चैट समाधान बनाना"],
      Hinglish: ["Prompt designer agency job track", "AI workflow optimization consulting", "Custom chatbot builder freelancing projects"]
    },
    keyConcepts: {
      English: ["Prompt engineering job parameters", "Automation workflow consulting rules", "API pipeline architecture"],
      Hindi: ["प्रॉम्प्ट इंजीनियरिंग जॉब मापदंड", "स्वचालन वर्कफ़्लो परामर्श", "एपीआई पाइपलाइन आर्किटेक्चर"],
      Hinglish: ["Job landscape parameters", "No-code integration business metrics", "Cross API connectivity design"]
    },
    myth_vs_reality: {
      English: {
        myth: "You must have a PhD in Computer Science to work in the AI industry.",
        reality: "Prompt engineering, workflow automation, and AI consulting only require logic, system design, and execution."
      },
      Hindi: {
        myth: "एआई उद्योग में काम करने के लिए कंप्यूटर साइंस में पीएचडी होना जरूरी है।",
        reality: "प्रॉम्प्ट इंजीनियरिंग और स्वचालन के लिए केवल तार्किक सोच और एआई टूल्स चलाने की समझ आवश्यक है।"
      },
      Hinglish: {
        myth: "AI domain jobs pane ke liye deep calculus math ya software degree compulsory hai.",
        reality: "No-code automations aur prompt designs ke liye sirf logic, structure, aur tool usage limits detail check chahiye."
      }
    },
    remember: {
      English: "Mastering AI tool integration is highly valuable; companies pay for execution speed.",
      Hindi: "एआई उपकरणों को जोड़ने और स्वचालित करने की कला सीखें; कंपनियां समय बचाने के पैसे देती हैं।",
      Hinglish: "API tools connections aur automation workflows setup create karne ki high market demand hai."
    },
    checkpoint: {
      question: {
        English: "What does an AI Integration Specialist focus on?",
        Hindi: "एआई इंटीग्रेशन विशेषज्ञ मुख्य रूप से किस पर ध्यान केंद्रित करता है?",
        Hinglish: "AI Integration Specialist ka main project role kya hota hai?"
      },
      options: {
        English: [
          "Connecting AI APIs with database software using automation tools.",
          "Writing raw assembly code for graphic cards.",
          "Repairing broken monitor hardware cables.",
          "Uploading static files templates to Wikipedia."
        ],
        Hindi: [
          "स्वचालन उपकरणों का उपयोग करके एआई एपीआई को डेटाबेस सॉफ्टवेयर से जोड़ना।",
          "ग्राफिक कार्ड के लिए कच्चे असेंबली कोड लिखना।",
          "टूटे हुए मॉनिटर हार्डवेयर केबलों की मरम्मत करना।",
          "विकिपीडिया पर स्थिर फ़ाइलें टेम्पलेट अपलोड करना।"
        ],
        Hinglish: [
          "Different software platforms aur AI APIs ko Make/Zapier se link aur automate karna.",
          "Offline chip layout designs parameters updates.",
          "Local drive storage folder clean rules configuration.",
          "Monitor refresh frame configurations limits adjustments."
        ]
      },
      correct: 0,
      explanation: {
        English: "Integration specialists build pipelines linking various services (triggers and actions) without coding models.",
        Hindi: "इंटीग्रेशन विशेषज्ञ विभिन्न सॉफ्टवेयर सेवाओं को आपस में जोड़कर डेटा प्रवाह को आसान बनाते हैं।",
        Hinglish: "Tool integrations and API mapping coordinate systems setup execute karna specialization hai."
      }
    }
  },
  {
    id: "EDU_040",
    difficulty: "Advanced",
    time: "1 min",
    prerequisite: { English: "Career Opportunities in AI", Hindi: "एआई में करियर के अवसर", Hinglish: "Career Opportunities in AI" },
    title: {
      English: "How to Continue Learning",
      Hindi: "सीखते कैसे रहें?",
      Hinglish: "How to Continue Learning"
    },
    summary: {
      English: "Keep learning by building small projects, testing new APIs, and reading research.",
      Hindi: "छोटे प्रोजेक्ट बनाकर, नए एपीआई का परीक्षण करके और शोध पढ़कर सीखते रहें।",
      Hinglish: "Daily updates ke liye custom prototype tools banayein aur standard blogs check karte rahein."
    },
    explanation: {
      English: "AI evolves every week. To stay ahead: 1) Build projects (don't just read; create real automated sheets or custom chatbots). 2) Stay updated (read blogs like Hugging Face, follow developer communities). 3) Practice prompt design continuously on platforms like AI-OS.",
      Hindi: "एआई हर हफ्ते बदलता है। आगे रहने के लिए: 1) प्रोजेक्ट बनाएं (केवल पढ़ें नहीं, चैटबॉट या डेटा शीट बनाएं)। 2) अपडेट रहें (हगिंग फेस ब्लॉग पढ़ें)। 3) लगातार नए एआई टूल्स का उपयोग करें।",
      Hinglish: "AI science daily change hoti hai. Steps: 1) Project compile (theory chodo, actual custom chatbots and automatic loops build karo). 2) Community connection (Hugging Face notebooks check updates). 3) Practice logic blocks dynamically. You are ready!"
    },
    examples: {
      English: ["Building a custom personal portfolio chatbot", "Following Hugging Face daily developer blogs", "Submitting open source prompts templates"],
      Hindi: ["एक कस्टम व्यक्तिगत पोर्टफोलियो चैटबॉट बनाना", ["हगिंग फेस दैनिक डेवलपर ब्लॉग पढ़ना"], ["ओपन सोर्स प्रॉम्प्ट टेम्पलेट साझा करना"]],
      Hinglish: ["Building personal private notes RAG chat app", "Reading Hugging Face releases guides", "Submitting optimized prompts templates databases"]
    },
    keyConcepts: {
      English: ["Continuous practical building", "Keeping up with developer releases", "Advanced sandbox testing tools"],
      Hindi: ["निरंतर व्यावहारिक निर्माण", "डेवलपर रिलीज के साथ अपडेट रहना", "उन्नत सैंडबॉक्स परीक्षण उपकरण"],
      Hinglish: ["Hands-on project validation", "Tracking dynamic GitHub release tags", "Advanced system configuration checks"]
    },
    myth_vs_reality: {
      English: {
        myth: "You can fully learn AI in a single weekend bootcamp course.",
        reality: "bootcamps teach static rules. AI changes fast; continuous building is the only way to master it."
      },
      Hindi: {
        myth: "आप एक सिंगल वीकेंड बूटकैंप कोर्स में पूरी तरह से एआई सीख सकते हैं।",
        reality: "बूटकैंप केवल बुनियादी बातें बताते हैं। एआई तेजी से बदलता है; लगातार काम करना ही इसे सीखने का एकमात्र तरीका है।"
      },
      Hinglish: {
        myth: "AI course certificate lene ke baad study finish ho jati hai.",
        reality: "Static templates tools scale change hote rehte hain. Continuous practice and active coding hi master hone ka path hai."
      }
    },
    remember: {
      English: "The best way to learn AI is by building small projects that solve real problems.",
      Hindi: "एआई सीखने का सबसे अच्छा तरीका छोटे प्रोजेक्ट बनाना है जो वास्तविक समस्याओं को हल करें।",
      Hinglish: "AI seekhne ka best way chote practical prototype apps run aur test karte rehna hai."
    },
    checkpoint: {
      question: {
        English: "What is the most effective learning habit to master AI technologies?",
        Hindi: "एआई तकनीकों में महारत हासिल करने के लिए सबसे प्रभावी सीखने की आदत क्या है?",
        Hinglish: "AI technologies ka absolute master banane ke liye baseline habit kya honi chahiye?"
      },
      options: {
        English: [
          "Building small practical projects continuously and testing new developer APIs.",
          "Collecting certificate graphics prints without building programs.",
          "Deactivating the local server networks settings.",
          "Uninstalling software tools from coding editors."
        ],
        Hindi: [
          "लगातार छोटे व्यावहारिक प्रोजेक्ट बनाना और नए डेवलपर एपीआई का परीक्षण करना।",
          "प्रोग्राम बनाए बिना सर्टिफिकेट ग्राफ़िक्स प्रिंट एकत्र करना।",
          "स्थानीय सर्वर नेटवर्क सेटिंग्स को निष्क्रिय करना।",
          "कोडिंग संपादकों से सॉफ़्टवेयर टूल अनइंस्टॉल करना।"
        ],
        Hinglish: [
          "Continuous project deployment prototype building aur API logs coordinate checks check rules.",
          "Certificates files gather setup without executing models.",
          "System hardware config offline framework details remove.",
          "Display graphics adapter reset command lines execution."
        ]
      },
      correct: 0,
      explanation: {
        English: "Active building creates mental mappings of constraints, APIs variables, and deployment debug methods.",
        Hindi: "सक्रिय रूप से प्रोजेक्ट बनाने से कोडिंग एरर ठीक करने और टूल्स को समझने की क्षमता बढ़ती है।",
        Hinglish: "Hands-on model creation and system configurations integration hi best learning flow hai."
      }
    }
  }
];

// Export to globally accessible namespace
if (typeof window !== "undefined") {
  window.exploringAIRoadmap = exploringAIRoadmap;
}
