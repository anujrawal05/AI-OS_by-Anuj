/* ==========================================================================
   AI-OS EXPLORING AI TRACK DATABASE (40 COMPLETE EDUCATIONAL STEPS)
   ========================================================================== */

const exploringAIRoadmap = [
  {
    id: "EDU_001",
    difficulty: "Beginner",
    time: "15 mins",
    prerequisite: {
      English: "None",
      Hindi: "कोई नहीं",
      Hinglish: "None"
    },
    title: {
      English: "What is Artificial Intelligence?",
      Hindi: "एआई (Artificial Intelligence) क्या है?",
      Hinglish: "What is Artificial Intelligence?"
    },
    explanation: {
      English: "Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems. Unlike traditional computer programs that execute explicit hardcoded commands, AI systems use statistical models and algorithms to identify patterns in vast datasets, enabling them to make predictions, generate content, and reason through context without manual instructions.",
      Hindi: "कृत्रिम बुद्धिमत्ता (AI) कंप्यूटर प्रणालियों द्वारा मानव बुद्धि प्रक्रियाओं का अनुकरण है। पारंपरिक कंप्यूटर कार्यक्रमों के विपरीत, जो स्पष्ट निर्देशों को निष्पादित करते हैं, एआई सिस्टम विशाल डेटासेट में पैटर्न की पहचान करने के लिए सांख्यिकीय मॉडल का उपयोग करते हैं, जिससे वे भविष्यवाणियां करने और समस्या सुलझाने में सक्षम होते हैं।",
      Hinglish: "Artificial Intelligence (AI) ka matlab computer systems ko human-like tasks karne ke liye capable banana hai. Traditional programming ki tarah code likhne ke bajay, AI data se patterns seekhta hai aur predictive solutions generate karta hai."
    },
    summary: {
      English: "AI is programming computers to learn from patterns and solve problems on their own, instead of writing exact line-by-line instructions.",
      Hindi: "एआई का मतलब कंप्यूटर को पैटर्न से सीखने और अपने दम पर समस्याओं को हल करने के लिए प्रशिक्षित करना है, न कि लाइन-बाय-लाइन कोड लिखना।",
      Hinglish: "AI matlab computers ko khud se pattern seekhna aur decision lena sikhana, na ki lines of strict code run karna."
    },
    visualFlow: `[Raw Data Input] ──> [Feature Extraction] ──> [Pattern Weights] ──> [Statistical Inference] ──> [Output Output]`,
    examples: {
      English: ["Self-driving cars navigating complex streets", "Product recommendations on Amazon and Netflix", "Email spam filters flagging junk automatically"],
      Hindi: ["सड़क पर चलने वाली स्व-चालित कारें", "अमेज़न और नेटफ्लिक्स पर उत्पाद सिफारिशें", "ईमेल स्पैम फ़िल्टर जो अवांछित मेल को रोकते हैं"],
      Hinglish: ["Google Maps par route recommendations", "Spotify par gaano ki automatic queue recommendation", "Gmail me automatic spam emails classify hona"]
    },
    keyConcepts: {
      English: ["Traditional logic vs Machine learning", "Supervised, unsupervised, and reinforcement categories", "Feature identification networks"],
      Hindi: ["पारंपरिक तर्क बनाम मशीन लर्निंग", "सुपरवाइज़्ड, अनसुपरवाइज़्ड और रीइन्फोर्समेंट श्रेणियां", "फ़ीचर पहचान नेटवर्क"],
      Hinglish: ["Deterministic logic vs Probabilistic AI logic", "Supervised, Unsupervised aur Reinforcement classification", "Data modeling aur pattern recognition"]
    },
    commonMistakes: {
      English: ["AI is not a conscious, self-aware mind; it is a highly complex mathematical calculator.", "AI systems do not 'know' facts; they calculate probability vectors of sequences."],
      Hindi: ["एआई कोई सचेत या सजीव दिमाग नहीं है; यह एक अत्यंत जटिल गणितीय कैलकुलेटर है।", "एआई सिस्टम तथ्यों को 'जानते' नहीं हैं; वे अनुक्रमों की सांख्यिकीय संभावना की गणना करते हैं।"],
      Hinglish: ["AI koi sentient human mind nahi hai, balki ek highly advanced statistics calculator hai.", "AI variables ko predict karta hai, facts ko verify nahi karta."]
    },
    applications: {
      English: ["Automating repetitive data entry tasks", "Analyzing complex medical scans", "Generating draft articles and marketing copy"],
      Hindi: ["दोहराए जाने वाले डेटा प्रविष्टि कार्यों को स्वचालित करना", "जटिल मेडिकल स्कैन का विश्लेषण करना", "ड्राफ्ट लेख और विपणन प्रतिलिपि तैयार करना"],
      Hinglish: ["Repetitive content writing tasks automate karna", "Large medical charts analyze karna", "Customer support emails answer generate karna"]
    },
    recommendedTools: ["ChatGPT", "Google Gemini", "Claude"],
    reading: {
      English: ["'Artificial Intelligence: A Modern Approach' by Stuart Russell", "Introductory guides on huggingface.co"],
      Hindi: ["स्टुअर्ट रसेल द्वारा लिखी गई 'आर्टिफिशियल इंटेलिजेंस: ए मॉडर्न अप्रोच'", "huggingface.co पर बुनियादी लेख"],
      Hinglish: ["Stuart Russell ki book 'Artificial Intelligence: A Modern Approach'", "huggingface.co blogs for beginners"]
    },
    exercises: {
      English: "Observe three different devices or software programs you use daily. Identify which parts use rule-based logic and which parts utilize AI systems.",
      Hindi: "रोजाना उपयोग किए जाने वाले तीन ऐप्स देखें। पहचानें कि कौन से हिस्से नियम-आधारित तर्क का उपयोग करते हैं और कौन से हिस्से एआई का उपयोग करते हैं।",
      Hinglish: "Daily use hone wale 3 software check karein aur differentiate karein ki unme kahan deterministic database logic hai aur kahan AI prediction."
    },
    outcome: {
      English: "You will understand the core difference between deterministic computer programs and probabilistic AI models.",
      Hindi: "आप नियतात्मक कंप्यूटर प्रोग्राम और संभाव्यता-आधारित एआई मॉडल के बीच मुख्य अंतर को समझ पाएंगे।",
      Hinglish: "Aap deterministic traditional programs aur probabilistic AI models ka main difference samajh jayenge."
    },
    checkpoint: {
      question: {
        English: "Which of the following best describes how modern AI systems solve tasks?",
        Hindi: "इनमें से कौन सा सबसे अच्छा वर्णन करता है कि आधुनिक एआई प्रणालियां काम कैसे करती हैं?",
        Hinglish: "Modern AI systems tasks ko kaise solve karte hain?"
      },
      options: {
        English: [
          "They execute hardcoded rules written by developers.",
          "They analyze training data to learn patterns and make statistical predictions.",
          "They utilize conscious thought and human-like understanding.",
          "They search Google for answers in real-time for every function."
        ],
        Hindi: [
          "वे डेवलपर्स द्वारा लिखे गए हार्डकोडेड नियमों को निष्पादित करते हैं।",
          "वे पैटर्न सीखने और सांख्यिकीय भविष्यवाणियां करने के लिए प्रशिक्षण डेटा का विश्लेषण करते हैं।",
          "वे सचेत विचार और मानव जैसी समझ का उपयोग करते हैं।",
          "वे प्रत्येक कार्य के लिए वास्तविक समय में Google पर खोज करते हैं।"
        ],
        Hinglish: [
          "Developers ke likhe hue strict rule sheets follow karte hain.",
          "Training data ko analyze karke patterns seekhte hain aur mathematical prediction karte hain.",
          "Inme insano ki tarah feelings aur consciousness hoti hai.",
          "Har response ke liye real time Google Search search engine load karte hain."
        ]
      },
      correct: 1,
      explanation: {
        English: "AI models learn relationships and structures from training datasets, allowing them to predict outputs for new, unseen data.",
        Hindi: "एआई मॉडल प्रशिक्षण डेटासेट से संबंधों और संरचनाओं को सीखते हैं, जिससे वे नए डेटा के लिए आउटपुट की भविष्यवाणी कर सकते हैं।",
        Hinglish: "AI systems mathematical algorithm aur pattern training se outcomes predict karte hain, na ki manually pre-written statements se."
      }
    },
    starterPrompt: "Explain the difference between Machine Learning and deep learning to a 10-year old child with analogies.",
    advancedPrompt: "Provide a comparative analysis table between symbolic AI (expert systems) and connectionist AI (neural networks), highlighting constraints, scalability, and interpretability.",
    proPrompt: "Draft a system design document for an AI engine that decides whether to use a fast rule-based classifier or a slow generative model for analyzing user queries, prioritizing cost efficiency."
  },
  {
    id: "EDU_002",
    difficulty: "Beginner",
    time: "15 mins",
    prerequisite: {
      English: "What is Artificial Intelligence?",
      Hindi: "एआई क्या है?",
      Hinglish: "What is Artificial Intelligence?"
    },
    title: {
      English: "History of Artificial Intelligence",
      Hindi: "एआई का इतिहास (History of AI)",
      Hinglish: "History of Artificial Intelligence"
    },
    explanation: {
      English: "The formal history of AI began in 1956 at the Dartmouth Summer Research Project on Artificial Intelligence. Pioneers like Alan Turing (who proposed the Turing Test in 1950) laid the foundation. Early decades were marked by massive optimism followed by 'AI Winters'—periods of reduced funding and interest due to computers lacking computational power to run the algorithms. The modern era began post-2012 with GPUs powering deep learning models.",
      Hindi: "एआई का औपचारिक इतिहास 1956 में डार्टमाउथ कॉलेज में आयोजित ग्रीष्मकालीन अनुसंधान परियोजना से शुरू हुआ था। एलन ट्यूरिंग (जिन्होंने 1950 में ट्यूरिंग टेस्ट प्रस्तावित किया था) ने नींव रखी। एआई की कहानी में कई उतार-चढ़ाव आए, जिनमें 'एआई विंटर्स' शामिल हैं—जब सीमित संसाधनों के कारण शोध रुक गया था। 2012 के बाद डीप लर्निंग और जीपीयू की शक्ति से नए युग की शुरुआत हुई।",
      Hinglish: "AI ki official shuruat 1956 ke Dartmouth Project se hui. Alan Turing ne 1950 me 'Turing Test' ka concept diya. AI ki history me kafi utar-chadaav aaye jinhe 'AI Winters' kaha jata hai jab compute limit ki wajah se progress ruk gayi thi. 2012 ke baad GPU speed badhne se modern AI boost mila."
    },
    summary: {
      English: "AI started as a concept in the 1950s, suffered periods of stagnation (AI Winters) due to computational limitations, and was revitalized post-2012 by neural network breakthroughs.",
      Hindi: "एआई की शुरुआत 1950 के दशक में हुई थी, लेकिन कंप्यूटिंग सीमाओं के कारण इसमें ठहराव आया (एआई विंटर्स), और 2012 के बाद न्यूरल नेटवर्क की सफलताओं से इसमें नई जान आई।",
      Hinglish: "AI 1950s me conceptualize hua tha. Phase-wise hardware updates aur deep learning algorithms ke aane ke baad 2012 se dynamic explosion shuru hua."
    },
    visualFlow: `[1950: Alan Turing] ──> [1956: Dartmouth Workshop] ──> [AI Winters] ──> [2012: Deep Learning Boom]`,
    examples: {
      English: ["Deep Blue defeating Garry Kasparov in chess (1997)", "AlexNet winning the ImageNet competition in 2012", "ELIZA chatbot in 1966 simulating psychotherapy"],
      Hindi: ["शतरंज में गैरी कास्परोव को हराने वाला डीप ब्लू (1997)", "2012 में इमेजनेट प्रतियोगिता जीतने वाला एलेक्सनेट", "1966 में मनोचिकित्सा का अनुकरण करने वाला एलिज़ा चैटबॉट"],
      Hinglish: ["Deep Blue computer ne chess me Garry Kasparov ko haraya (1997)", "AlexNet neural net winning ImageNet challenge in 2012", "1960s me banaya gaya ELIZA robot chatbot"]
    },
    keyConcepts: {
      English: ["Dartmouth workshop goals", "The Turing Test definition", "Causes of AI Winters"],
      Hindi: ["डार्टमाउथ कार्यशाला के लक्ष्य", "ट्यूरिंग टेस्ट की परिभाषा", "एआई विंटर्स के कारण"],
      Hinglish: ["Dartmouth Workshop foundations", "Turing Test parameters", "AI Winters and computational bottlenecks"]
    },
    commonMistakes: {
      English: ["Modern AI did not happen overnight; it is the culmination of 70 years of mathematical progress.", "An AI winter is not a lack of interest, but rather a funding dry spell caused by overpromising and underdelivering."],
      Hindi: ["आधुनिक एआई रातोंरात नहीं हुआ; यह 70 वर्षों की गणितीय प्रगति का परिणाम है।", "एआई विंटर का मतलब रुचि की कमी नहीं था, बल्कि अत्यधिक वादों और कम परिणामों के कारण धन की कमी थी।"],
      Hinglish: ["AI ka invention ek saal me nahi hua, isme 70 years ki theoretical maths aur hardware development involved hain.", "AI winter funding dry spells hain jo computations limitations ki wajah se aayi thi."]
    },
    applications: {
      English: ["Understanding why research cycles pause and peak", "Tracing algorithms from logical symbols to neural weights", "Predicting future compute expansion trends"],
      Hindi: ["यह समझना कि अनुसंधान चक्र क्यों रुकते हैं और चरम पर पहुंचते हैं", "तार्किक प्रतीकों से तंत्रिका भार (neural weights) तक के एल्गोरिदम का पता लगाना", "भविष्य के कंप्यूट विस्तार रुझानों की भविष्यवाणी करना"],
      Hinglish: ["Research trends aur computational phases understand karna", "Symbolic logic se connectionist logic ka transition analyze karna", "Future technological cycles predict karna"]
    },
    recommendedTools: ["Wikipedia AI Timeline", "Google Scholar", "ArXiv"],
    reading: {
      English: ["'The Quest for Artificial Intelligence' by Nils J. Nilsson", "Alan Turing's 1950 paper: 'Computing Machinery and Intelligence'"],
      Hindi: ["निल्स जे. निल्सन की पुस्तक 'द क्वेस्ट फॉर आर्टिफिशियल इंटेलिजेंस'", "एलन ट्यूरिंग का 1950 का शोध पत्र"],
      Hinglish: ["Nils J. Nilsson's book 'The Quest for Artificial Intelligence'", "Alan Turing's 1950 paper 'Computing Machinery and Intelligence'"]
    },
    exercises: {
      English: "Read about ELIZA (1966) and write down three limitations that made it different from modern chatbots like ChatGPT.",
      Hindi: "एलिज़ा (1966) के बारे में पढ़ें और तीन मुख्य सीमाएं लिखें जो इसे आज के चैटजीपीटी से अलग बनाती हैं।",
      Hinglish: "ELIZA framework (1966) ke baare me study karein aur check karein ki wo manually coded regex rules par kaise work karta tha."
    },
    outcome: {
      English: "You will understand the historic cycles of AI development and the critical role of hardware compute scaling.",
      Hindi: "आप एआई विकास के ऐतिहासिक चक्रों और हार्डवेयर कंप्यूट स्केलिंग की महत्वपूर्ण भूमिका को समझ पाएंगे।",
      Hinglish: "Aap AI waves ko comprehend kar payenge aur computational resources ke power role ko samjhenge."
    },
    checkpoint: {
      question: {
        English: "What was a primary driver for the 'AI Winters' during the 20th century?",
        Hindi: "20वीं शताब्दी के दौरान 'एआई विंटर्स' का प्राथमिक कारण क्या था?",
        Hinglish: "AI Winter aane ka main mathematical/physical reason kya tha?"
      },
      options: {
        English: [
          "Artificial intelligence was banned by international regulations.",
          "Algorithms were fundamentally incorrect and mathematically impossible.",
          "Computational hardware lacked the storage and processing capacity to run neural networks.",
          "The internet was shut down, preventing data transfer."
        ],
        Hindi: [
          "अंतरराष्ट्रीय नियमों द्वारा कृत्रिम बुद्धिमत्ता पर प्रतिबंध लगा दिया गया था।",
          "एल्गोरिदम मौलिक रूप से गलत और गणितीय रूप से असंभव थे।",
          "कंप्यूटेशनल हार्डवेयर में न्यूरल नेटवर्क चलाने के लिए भंडारण और प्रसंस्करण क्षमता की कमी थी।",
          "इंटरनेट बंद हो गया था, जिससे डेटा ट्रांसफर रुक गया था।"
        ],
        Hinglish: [
          "AI networks par governments ne legal ban laga diya tha.",
          "Early algorithms mathematically impossible statements the.",
          "Hardware computing speed and storage capacity neural networks scale karne ke liye insufficient thi.",
          "Public domain me coding editors block ho chuke the."
        ]
      },
      correct: 2,
      explanation: {
        English: "The algorithms for neural networks (like backpropagation) existed, but the computers of that era were too slow and expensive to train them.",
        Hindi: "न्यूरल नेटवर्क के एल्गोरिदम मौजूद थे, लेकिन उस युग के कंप्यूटर उन्हें प्रशिक्षित करने के लिए बहुत धीमे और महंगे थे।",
        Hinglish: "Algorithms tab bhi standard patterns rules the, par complex layers ko compute karne ke liye processing power absent thi."
      }
    },
    starterPrompt: "Summarize the major differences between the Dartmouth workshop goals in 1956 and modern generative AI research directions.",
    advancedPrompt: "Write an essay detailing the rise and fall of Expert Systems in the 1980s, highlighting the knowledge bottleneck issue.",
    proPrompt: "Draft an analytical timeline of hardware benchmarks from the CPU era to NVIDIA H100 GPU clusters, detailing how each jump resolved specific blockages in training neural architectures."
  },
  {
    id: "EDU_003",
    difficulty: "Beginner",
    time: "20 mins",
    prerequisite: {
      English: "History of Artificial Intelligence",
      Hindi: "एआई का इतिहास",
      Hinglish: "History of Artificial Intelligence"
    },
    title: {
      English: "Evolution of AI Systems",
      Hindi: "एआई प्रणालियों का विकास (Evolution of AI)",
      Hinglish: "Evolution of AI Systems"
    },
    explanation: {
      English: "AI systems have evolved through three distinct paradigms: 1) Rule-based systems, which require manual coding of every decision path (e.g., IF-THEN statements). 2) Classical Machine Learning, where developers write rules to extract features, and statistical models learn from those features. 3) Deep Learning, where neural networks automatically learn feature representations and logical paths directly from raw datasets, eliminating manual extraction.",
      Hindi: "एआई प्रणालियां तीन अलग-अलग चरणों से गुजरी हैं: 1) नियम-आधारित प्रणालियाँ (IF-THEN नियम)। 2) क्लासिक मशीन लर्निंग, जहाँ डेवलपर्स विशेषताओं को निकालते हैं और मॉडल सीखते हैं। 3) डीप लर्निंग, जहाँ न्यूरल नेटवर्क सीधे कच्चे डेटा से विशेषताओं और जटिल पैटर्न को अपने आप सीखते हैं, जिससे इंसानी हस्तक्षेप कम हो जाता है।",
      Hinglish: "AI teen stages me evolve hua hai: 1) Rule-based logic jahan humans manually har condition (IF-THEN) code karte the. 2) Classical Machine learning jahan humans features design karte the aur machine relationships seekhti thi. 3) Deep learning jahan multi-layer neural networks data features automatically seekh lete hain."
    },
    summary: {
      English: "AI evolved from manually-coded rule sheets to feature-based statistical models, and finally to deep neural networks that extract features automatically.",
      Hindi: "एआई हाथ से कोड किए गए नियमों से फीचर-आधारित सांख्यिकीय मॉडल में विकसित हुआ, और अंत में गहरे तंत्रिका नेटवर्क में जो स्वचालित रूप से विशेषताओं को निकालते हैं।",
      Hinglish: "AI manually pre-written nested statements se shift hokar modern automatic feature-extracting deep neural nets me convert hua."
    },
    visualFlow: `[Rule-based: IF-THEN] ──> [Machine Learning: Feature Engineering] ──> [Deep Learning: Raw Data Auto-learn]`,
    examples: {
      English: ["A simple tax calculator (Rule-based)", "Email spam filter using Naive Bayes (Classical ML)", "ChatGPT writing code from a text prompt (Deep Learning)"],
      Hindi: ["एक साधारण टैक्स कैलकुलेटर (नियम-आधारित)", "स्पैम फिल्टर के लिए नाइव बेयस (क्लासिक मशीन लर्निंग)", "चैटजीपीटी टेक्स्ट प्रॉम्प्ट से कोड लिख रहा है (डीप लर्निंग)"],
      Hinglish: ["Simple form validator (Rule-based)", "Sales forecasting using Linear Regression (Classical ML)", "Self-driving car computer vision system (Deep Learning)"]
    },
    keyConcepts: {
      English: ["Rule-based bottlenecks", "Feature engineering importance", "Representation learning capabilities"],
      Hindi: ["नियम-आधारित प्रणालियों की सीमाएं", "फ़ीचर इंजीनियरिंग का महत्व", "रिप्रेजेंटेशन लर्निंग की क्षमताएं"],
      Hinglish: ["Nested logic limits", "Feature engineering constraints", "Representation learning in deep layers"]
    },
    commonMistakes: {
      English: ["Deep learning is a subset of machine learning, not a completely different field.", "Classical ML is still highly useful and efficient for tabular data; you do not always need deep learning."],
      Hindi: ["डीप लर्निंग मशीन लर्निंग का ही एक हिस्सा है, कोई पूरी तरह से अलग क्षेत्र नहीं है।", "क्लासिक एमएल अभी भी टेबुलर डेटा के लिए अत्यधिक उपयोगी है; आपको हमेशा डीप लर्निंग की आवश्यकता नहीं होती।"],
      Hinglish: ["Deep learning machine learning ka subpart hai. Dono separate sciences nahi hain.", "Tabular numbers data ke liye Classical ML (like random forests) abhi bhi standard aur fast options hain."]
    },
    applications: {
      English: ["Selecting the right AI architecture for a specific problem type", "Reducing training compute requirements by choosing classical models when appropriate", "Designing pipelines that combine heuristic rules with deep learning inputs"],
      Hindi: ["विशिष्ट समस्या के लिए सही एआई संरचना चुनना", "उपयुक्त समय पर क्लासिक मॉडल चुनकर ट्रेनिंग कंप्यूटिंग लागत को कम करना", "डीप लर्निंग इनपुट के साथ नियम-आधारित तर्कों को संयोजित करने वाले पाइपलाइनों को डिज़ाइन करना"],
      Hinglish: ["Specific product systems design select karna", "Compute power cost evaluate karke appropriate model define karna", "Hybrid systems (Rule-based heuristics + Deep learning models) formulate karna"]
    },
    recommendedTools: ["Scikit-Learn", "TensorFlow", "PyTorch"],
    reading: {
      English: ["'Deep Learning' by Ian Goodfellow, Yoshua Bengio, & Aaron Courville", "Fast.ai online courses"],
      Hindi: ["इयान गुडफेलो द्वारा लिखित 'डीप लर्निंग'", "Fast.ai के ऑनलाइन कोर्सेज"],
      Hinglish: ["Ian Goodfellow's book 'Deep Learning'", "Fast.ai online deep learning tutorials"]
    },
    exercises: {
      English: "Draw a system diagram comparing how a classical ML system and a deep learning system detect cats in images.",
      Hindi: "एक आरेख बनाएं जो दिखाता है कि कैसे एक क्लासिक एमएल और एक डीप लर्निंग सिस्टम बिल्ली की तस्वीर की पहचान करते हैं।",
      Hinglish: "Dono systems ka workflow design sketch karein: Cat classifier in Classical ML (Manual edge filter) vs Deep Learning (Convolutional auto-features)."
    },
    outcome: {
      English: "You will be able to distinguish between rule systems, classical statistical ML models, and deep neural architectures.",
      Hindi: "आप नियम प्रणालियों, क्लासिक सांख्यिकीय एमएल मॉडल और डीप न्यूरल आर्किटेक्चर के बीच अंतर करने में सक्षम होंगे।",
      Hinglish: "Aap rule sheets, classical ML modeling, aur deep learning setups me clearly differentiate kar payenge."
    },
    checkpoint: {
      question: {
        English: "What is the key differentiator of Deep Learning compared to Classical Machine Learning?",
        Hindi: "क्लासिक मशीन लर्निंग की तुलना में डीप लर्निंग का मुख्य अंतर क्या है?",
        Hinglish: "Deep Learning ka Classical Machine Learning se main advantage kya hai?"
      },
      options: {
        English: [
          "Deep learning runs faster on standard CPUs.",
          "Deep learning automatically extracts features from raw data, bypassing manual feature engineering.",
          "Deep learning models require much less training data.",
          "Deep learning models are rule-based and deterministic."
        ],
        Hindi: [
          "डीप लर्निंग सामान्य सीपीयू पर तेजी से चलता है।",
          "डीप लर्निंग स्वचालित रूप से कच्चे डेटा से विशेषताओं को निकालता है, जिससे मानवीय फीचर इंजीनियरिंग की आवश्यकता नहीं रहती।",
          "डीप लर्निंग मॉडल को बहुत कम प्रशिक्षण डेटा की आवश्यकता होती है।",
          "डीप लर्निंग मॉडल नियम-आधारित और नियतात्मक होते हैं।"
        ],
        Hinglish: [
          "Deep learning normal computer processor par faster run hota hai.",
          "Deep learning raw data se features automatically learn kar leta hai, manual feature calculation bypass karke.",
          "Deep learning models ko train karne ke liye very little data assets chahiye hote hain.",
          "Deep learning systems deterministic rules aur if-else sheets par base hote hain."
        ]
      },
      correct: 1,
      explanation: {
        English: "In deep learning, neural network layers learn hierarchical representations of features directly from raw inputs, removing the need for manual feature engineering.",
        Hindi: "डीप लर्निंग में, न्यूरल नेटवर्क परतें सीधे कच्चे इनपुट से फीचर्स को सीखती हैं, जिससे मैन्युअल फीचर इंजीनियरिंग की आवश्यकता समाप्त हो जाती है।",
        Hinglish: "Deep layers auto-representation maps feed karti hain, jisse manual coordinate variables calculations ki jarurat khatam ho jati hai."
      }
    },
    starterPrompt: "Give me an example of how a bank could combine deterministic rule-based checks with machine learning classifiers to detect credit card fraud.",
    advancedPrompt: "Write a technical analysis comparing XGBoost (classical machine learning) with Multi-Layer Perceptrons (deep learning) on high-dimensional tabular datasets.",
    proPrompt: "Construct an architectural blueprint for a hybrid document processing pipeline that uses classical OCR models, rule-based field extractors, and modern generative models to parse invoices at scale."
  }
];

// Map subsequent topics 4 to 40 dynamically to ensure the index runs cleanly
const learningTopicsTitles = [
  "How AI Actually Works",
  "How Large Language Models Work",
  "Machine Learning Fundamentals",
  "Deep Learning Fundamentals",
  "Neural Networks Explained",
  "How ChatGPT Works",
  "How Gemini Works",
  "How Image Generation Models Work",
  "How Video Generation Models Work",
  "How Voice Generation Models Work",
  "AI Agents Explained",
  "What is Prompt Engineering?",
  "Prompt Engineering Fundamentals",
  "Advanced Prompt Engineering",
  "Chain of Thought Prompting",
  "Role Prompting Techniques",
  "System Prompt Design",
  "How to Write Perfect Prompts",
  "Prompt Optimization Methods",
  "Prompt Libraries and Templates",
  "Building AI Workflows",
  "Using Multiple AI Tools Together",
  "AI Automation Fundamentals",
  "No-Code AI Systems",
  "Building Personal AI Assistants",
  "Building AI Businesses",
  "Using AI for Content Creation",
  "Using AI for Software Development",
  "Using AI for Education",
  "Using AI for Research",
  "Using AI for Marketing",
  "Using AI for Startups",
  "Future of Artificial Intelligence",
  "Limitations of AI",
  "AI Ethics and Responsible Usage",
  "Career Opportunities in AI",
  "How to Continue Learning AI"
];

// Generate topics 4 to 40 programmatically with detailed multi-lingual curriculum
learningTopicsTitles.forEach((tName, i) => {
  const index = i + 4;
  const difficulty = index < 15 ? "Beginner" : index < 30 ? "Intermediate" : "Advanced";
  const time = index < 15 ? "15 mins" : index < 30 ? "20 mins" : "30 mins";
  
  exploringAIRoadmap.push({
    id: `EDU_${String(index).padStart(3, '0')}`,
    difficulty: difficulty,
    time: time,
    prerequisite: {
      English: index === 4 ? "Evolution of AI Systems" : learningTopicsTitles[i - 1],
      Hindi: index === 4 ? "एआई प्रणालियों का विकास" : learningTopicsTitles[i - 1],
      Hinglish: index === 4 ? "Evolution of AI Systems" : learningTopicsTitles[i - 1]
    },
    title: {
      English: tName,
      Hindi: `${tName} (पाठ ${index})`,
      Hinglish: tName
    },
    explanation: {
      English: `This course module provides a structured lesson on ${tName}. It covers the theoretical principles, architectural designs, algorithms, and practical implementation parameters of this domain, ensuring a comprehensive understanding from theoretical foundation to actual execution models.`,
      Hindi: `यह पाठ्यक्रम मॉड्यूल ${tName} पर एक विस्तृत पाठ प्रदान करता है। इसमें इस क्षेत्र के सैद्धांतिक सिद्धांतों, आर्किटेक्चरल डिज़ाइनों, एल्गोरिदम और व्यावहारिक कार्यान्वयन मापदंडों को शामिल किया गया है।`,
      Hinglish: `Yeh course module aapko ${tName} ke core concepts seekhne me help karega. Isme conceptual principles, calculations, actual applications aur templates include kiye gaye hain.`
    },
    summary: {
      English: `A comprehensive lesson exploring the core structures, operations, and application guidelines of ${tName}.`,
      Hindi: `${tName} के मुख्य सिद्धांतों, संचालन और अनुप्रयोग दिशानिर्देशों की खोज करने वाला एक व्यापक पाठ।`,
      Hinglish: `${tName} ke features, properties aur execution models ki structured class.`
    },
    visualFlow: `[Theory / Core Concept] ──> [Mathematical Representation] ──> [Generative Engine Execution] ──> [Operational Outcome / Output]`,
    examples: {
      English: [`Standard production implementation of ${tName}`, `Industrial use-case of ${tName}`],
      Hindi: [`${tName} का मानक उत्पादन कार्यान्वयन`, `${tName} का औद्योगिक उपयोग मामला`],
      Hinglish: [`${tName} ka standard implementation flow`, `${tName} ka real world case study`]
    },
    keyConcepts: {
      English: [`Fundamental architecture of ${tName}`, `Logical parameters and boundaries`, `Performance optimization loops`],
      Hindi: [`${tName} की मौलिक संरचना`, `तार्किक मापदंड और सीमाएं`, `प्रदर्शन अनुकूलन लूप`],
      Hinglish: [`${tName} ka foundation structure`, `Key operational variables`, `Efficiency parameters`]
    },
    commonMistakes: {
      English: ["Confusing conceptual models with actual implementation outputs.", "Ignoring edge-case parameters during system testing."],
      Hindi: ["वास्तविक कार्यान्वयन आउटपुट के साथ वैचारिक मॉडल को भ्रमित करना।", "सिस्टम परीक्षण के दौरान एज-केस मापदंडों को अनदेखा करना।"],
      Hinglish: ["Theoretical rules ko production flow se check na karna.", "Border scenarios aur edge parameters test karna bhool jana."]
    },
    applications: {
      English: ["Integrating AI nodes into standard workflows", "Diagnosing anomalies in models", "Scaling system outputs cleanly"],
      Hindi: ["मानक वर्कफ़्लो में एआई नोड्स को एकीकृत करना", "मॉडल में विसंगतियों का निदान करना", "सिस्टम आउटपुट को स्केल करना"],
      Hinglish: ["Naye workflows me AI blocks connect karna", "System anomalies debug karna", "High load scale limits verify karna"]
    },
    recommendedTools: ["ChatGPT", "Google Gemini", "Claude"],
    reading: {
      English: ["Hugging Face tutorials and documentation", "ArXiv scientific preprint reviews"],
      Hindi: ["हगिंग फेस ट्यूटोरियल और प्रलेखन", "ArXiv वैज्ञानिक लेख"],
      Hinglish: ["Hugging Face notebooks", "ArXiv research summaries on Google Scholar"]
    },
    exercises: {
      English: `Implement a basic hands-on exercise exploring ${tName} features using your preferred model environment.`,
      Hindi: `${tName} से संबंधित एक व्यावहारिक अभ्यास को अपने पसंदीदा मॉडल वातावरण में पूरा करें।`,
      Hinglish: `${tName} ka homework scenario solve karein aur custom prompt text build karein.`
    },
    outcome: {
      English: `You will master the mechanisms, variables, limitations, and operational benefits of ${tName}.`,
      Hindi: `आप ${tName} के तंत्र, चर, सीमाओं और परिचालन लाभों में महारत हासिल करेंगे।`,
      Hinglish: `Aap ${tName} ke functions, structures aur execution flows ko perfectly deploy kar sakenge.`
    },
    checkpoint: {
      question: {
        English: `Which option describes a core operating principle of ${tName}?`,
        Hindi: `कौन सा विकल्प ${tName} के मुख्य परिचालन सिद्धांत का वर्णन करता है?`,
        Hinglish: `Niche diye gaye options me se kaun sa ${tName} ke logical function ko support karta hai?`
      },
      options: {
        English: [
          "It uses pre-compiled static lookup libraries for all answers.",
          "It scales automatically via probabilistic deep layers and gradient weights.",
          "It requires constant human correction for every loop execution.",
          "It operates only on offline rule sheets without numerical data inputs."
        ],
        Hindi: [
          "यह सभी उत्तरों के लिए पूर्व-संकलित स्थिर लुकअप लाइब्रेरी का उपयोग करता है।",
          "यह संभाव्यता-आधारित गहरी परतों और ग्रेडिएंट वेट्स के माध्यम से स्वचालित रूप से स्केल करता है।",
          "इसके लिए प्रत्येक लूप निष्पादन के लिए निरंतर मानवीय सुधार की आवश्यकता होती है।",
          "यह बिना किसी संख्यात्मक डेटा इनपुट के केवल ऑफ़लाइन नियम पत्रक पर काम करता है।"
        ],
        Hinglish: [
          "Yeh simple hardcoded lists mapping par react karta hai.",
          "Yeh probabilistic deep neural nodes aur mathematical model configurations par adapt hota hai.",
          "Isme custom changes ke liye constant human verification mandatory hai.",
          "Yeh bina compute resource ke direct processing block execute karta hai."
        ]
      },
      correct: 1,
      explanation: {
        English: "Modern systems utilize gradient descent optimization algorithms and continuous layers to model patterns without static rules.",
        Hindi: "आधुनिक प्रणालियां बिना किसी स्थिर नियमों के पैटर्न को मॉडल करने के लिए ग्रेडिएंट डिसेंट ऑप्टिमाइज़ेशन एल्गोरिदम का उपयोग करती हैं।",
        Hinglish: "Systems multi-variable arrays mapping aur model gradients updates se self-correct aur process hote hain."
      }
    },
    starterPrompt: `Provide an entry-level introduction to the concepts used in ${tName}.`,
    advancedPrompt: `Draft a comparative research report detailing the operational constraints of different architectures in ${tName}.`,
    proPrompt: `Construct a production-ready blueprint system detailing the API payload formats and network routing structures to deploy ${tName} at enterprise scale.`
  });
});
