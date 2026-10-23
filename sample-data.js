/**
 * Sample Vocabularies & Fallback Academic Dictionary
 * Preloaded with rich linguistics data (IPA, Word Families, Examples, Collocations)
 */

const SAMPLE_WORDS = [
  {
    word: "resilience",
    phonetic_uk: "/rɪˈzɪl.jəns/",
    phonetic_us: "/rɪˈzɪl.jəns/",
    part_of_speech: "noun",
    cefr_level: "B2",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    is_favorite: true,
    meanings: [
      {
        pos: "noun",
        definition_vi: "Khả năng phục hồi, tính kiên cường, sức bật tinh thần hoặc thể chất sau khó khăn",
        definition_en: "The capacity to recover quickly from difficulties; toughness and elasticity",
        examples: [
          {
            en: "She showed remarkable resilience in overcoming personal trauma.",
            vi: "Cô ấy đã thể hiện sự kiên cường phi thường khi vượt qua cú sốc cá nhân."
          },
          {
            en: "Economic resilience helped the nation withstand global market shocks.",
            vi: "Sức bật kinh tế đã giúp quốc gia này chống chịu các biến động của thị trường toàn cầu."
          }
        ]
      }
    ],
    word_family: {
      noun: ["resilience", "resiliency"],
      verb: ["resile"],
      adjective: ["resilient"],
      adverb: ["resiliently"]
    },
    synonyms: ["endurance", "fortitude", "toughness", "adaptability", "tenacity"],
    antonyms: ["fragility", "vulnerability", "weakness"],
    collocations: [
      { phrase: "build resilience", meaning_vi: "rèn luyện / xây dựng khả năng phục hồi" },
      { phrase: "remarkable resilience", meaning_vi: "sức bền / kiên cường đáng nể" },
      { phrase: "emotional resilience", meaning_vi: "sức bật tâm lý, khả năng vững vàng cảm xúc" }
    ],
    memory_tip: "Gốc từ La-tinh 'resilire' (bật lùi lại / nhảy lên). Tưởng tượng một quả bóng cao su ném xuống đất lại nảy lên mạnh mẽ hơn."
  },
  {
    word: "serendipity",
    phonetic_uk: "/ˌser.ənˈdɪp.ə.ti/",
    phonetic_us: "/ˌser.ənˈdɪp.ə.t̬i/",
    part_of_speech: "noun",
    cefr_level: "C1",
    timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
    is_favorite: true,
    meanings: [
      {
        pos: "noun",
        definition_vi: "Sự tình cờ may mắn, khả năng khám phá ra những điều tốt đẹp một cách tình cờ",
        definition_en: "The occurrence and development of events by chance in a happy or beneficial way",
        examples: [
          {
            en: "Finding my dream job while on vacation was pure serendipity.",
            vi: "Tìm được công việc mơ ước khi đang đi nghỉ mát quả là một cơ duyên may mắn kỳ diệu."
          },
          {
            en: "Penicillin was discovered through sheer serendipity by Alexander Fleming.",
            vi: "Thuốc kháng sinh Penicillin đã được phát hiện hoàn toàn nhờ vào một sự tình cờ may mắn của Alexander Fleming."
          }
        ]
      }
    ],
    word_family: {
      noun: ["serendipity"],
      verb: [],
      adjective: ["serendipitous"],
      adverb: ["serendipitously"]
    },
    synonyms: ["chance", "happy accident", "fluke", "fortune", "luck"],
    antonyms: ["misfortune", "adversity", "design"],
    collocations: [
      { phrase: "pure serendipity", meaning_vi: "hoàn toàn do duyên may" },
      { phrase: "moment of serendipity", meaning_vi: "khoảnh khắc tình cờ kỳ diệu" },
      { phrase: "serendipitous discovery", meaning_vi: "phát hiện tình cờ may mắn" }
    ],
    memory_tip: "Bắt nguồn từ truyện cổ tích 'The Three Princes of Serendip' - các hoàng tử luôn tình cờ phát hiện ra những kho báu quý giá mà họ không hề tìm kiếm trước đó."
  },
  {
    word: "eloquent",
    phonetic_uk: "/ˈel.ə.kwənt/",
    phonetic_us: "/ˈel.ə.kwənt/",
    part_of_speech: "adjective",
    cefr_level: "B2",
    timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    is_favorite: false,
    meanings: [
      {
        pos: "adjective",
        definition_vi: "Hùng biện, lưu loát, có khả năng diễn đạt biểu cảm và thuyết phục",
        definition_en: "Fluent or persuasive in speaking or writing; clearly expressing feelings",
        examples: [
          {
            en: "The lawyer gave an eloquent speech that moved the entire jury.",
            vi: "Vị luật sư đã có một bài phát biểu hùng hồn làm rung động toàn bộ bồi thẩm đoàn."
          },
          {
            en: "His silence was more eloquent than any words could be.",
            vi: "Sự im lặng của anh ấy còn có sức biểu cảm hơn bất kỳ lời nói nào."
          }
        ]
      }
    ],
    word_family: {
      noun: ["eloquence"],
      verb: [],
      adjective: ["eloquent"],
      adverb: ["eloquently"]
    },
    synonyms: ["articulate", "persuasive", "fluent", "expressive"],
    antonyms: ["inarticulate", "hesitant", "tongue-tied"],
    collocations: [
      { phrase: "eloquent speaker", meaning_vi: "diễn giả hùng biện lưu loát" },
      { phrase: "eloquent testimony", meaning_vi: "lời khai thuyết phục" },
      { phrase: "eloquent plea", meaning_vi: "lời khẩn cầu xúc động" }
    ],
    memory_tip: "Gốc từ 'loqu' trong tiếng La-tinh có nghĩa là 'nói' (như trong 'dialogue', 'loquacious'). E + loquent = người biết cách nói thoát ra những ý tứ sâu sắc."
  },
  {
    word: "pragmatic",
    phonetic_uk: "/præɡˈmæt.ɪk/",
    phonetic_us: "/præɡˈmæt̬.ɪk/",
    part_of_speech: "adjective",
    cefr_level: "C1",
    timestamp: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    is_favorite: false,
    meanings: [
      {
        pos: "adjective",
        definition_vi: "Thực tế, thực dụng, trọng tính khả thi hơn lý thuyết viển vông",
        definition_en: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations",
        examples: [
          {
            en: "We need a pragmatic approach to solve this urgent housing crisis.",
            vi: "Chúng ta cần một cách tiếp cận thực tế để giải quyết cuộc khủng hoảng nhà ở cấp bách này."
          },
          {
            en: "She took a pragmatic view of marriage and financial stability.",
            vi: "Cô ấy có cái nhìn rất thực tế về hôn nhân và sự ổn định tài chính."
          }
        ]
      }
    ],
    word_family: {
      noun: ["pragmatism", "pragmatist"],
      verb: [],
      adjective: ["pragmatic", "pragmatical"],
      adverb: ["pragmatically"]
    },
    synonyms: ["practical", "realistic", "sensible", "down-to-earth", "utilitarian"],
    antonyms: ["idealistic", "impractical", "unrealistic", "visionary"],
    collocations: [
      { phrase: "pragmatic approach", meaning_vi: "hướng tiếp cận thực tế" },
      { phrase: "pragmatic solution", meaning_vi: "giải pháp thực tiễn" },
      { phrase: "pragmatic decision", meaning_vi: "quyết định dựa trên thực tế" }
    ],
    memory_tip: "Liên tưởng đến 'practice' (thực hành) - người pragmatic luôn đặt việc thực hành và kết quả cụ thể lên hàng đầu."
  },
  {
    word: "ubiquitous",
    phonetic_uk: "/juːˈbɪk.wɪ.təs/",
    phonetic_us: "/juːˈbɪk.wə.t̬əs/",
    part_of_speech: "adjective",
    cefr_level: "C1",
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
    is_favorite: true,
    meanings: [
      {
        pos: "adjective",
        definition_vi: "Có mặt ở khắp mọi nơi, phổ biến rộng rãi cùng một lúc",
        definition_en: "Present, appearing, or found everywhere",
        examples: [
          {
            en: "Smartphones have become ubiquitous in modern society.",
            vi: "Điện thoại thông minh đã trở nên hiện diện ở khắp mọi nơi trong xã hội hiện đại."
          },
          {
            en: "Coffee shops are ubiquitous across downtown streets.",
            vi: "Các quán cà phê xuất hiện nhan nhản khắp các tuyến phố trung tâm."
          }
        ]
      }
    ],
    word_family: {
      noun: ["ubiquity", "ubiquitousness"],
      verb: [],
      adjective: ["ubiquitous"],
      adverb: ["ubiquitously"]
    },
    synonyms: ["omnipresent", "pervasive", "everywhere", "universal"],
    antonyms: ["rare", "scarce", "uncommon", "isolated"],
    collocations: [
      { phrase: "become ubiquitous", meaning_vi: "trở nên phổ biến khắp mọi nơi" },
      { phrase: "ubiquitous presence", meaning_vi: "sự hiện diện ở khắp nơi" },
      { phrase: "ubiquitous computing", meaning_vi: "điện toán khắp nơi (IoT)" }
    ],
    memory_tip: "Gốc từ La-tinh 'ubique' có nghĩa là 'khắp nơi' (everywhere). Tưởng tượng giống như Wifi hoặc Oxy - đi đâu cũng có."
  },
  {
    word: "innovation",
    phonetic_uk: "/ˌɪn.əˈveɪ.ʃən/",
    phonetic_us: "/ˌɪn.əˈveɪ.ʃən/",
    part_of_speech: "noun",
    cefr_level: "B2",
    timestamp: Date.now() - 1000 * 60 * 60 * 30,
    is_favorite: true,
    meanings: [
      {
        pos: "noun",
        definition_vi: "Sự đổi mới, sáng kiến cải tiến, phương pháp mới mang tính đột phá",
        definition_en: "The action or process of innovating; a new method, idea, product, etc.",
        examples: [
          {
            en: "Technological innovation has transformed the way we communicate.",
            vi: "Đổi mới công nghệ đã làm thay đổi hoàn toàn cách chúng ta giao tiếp."
          }
        ]
      }
    ],
    word_family: {
      noun: ["innovation", "innovator"],
      verb: ["innovate"],
      adjective: ["innovative"],
      adverb: ["innovatively"]
    },
    synonyms: ["novelty", "breakthrough", "advancement", "modernization"],
    antonyms: ["tradition", "stagnation"],
    collocations: [
      { phrase: "technological innovation", meaning_vi: "đổi mới công nghệ" },
      { phrase: "foster innovation", meaning_vi: "thúc đẩy đổi mới sáng tạo" }
    ],
    memory_tip: "In + nov (mới, giống như 'novel') -> đưa cái mới vào cuộc sống."
  },
  {
    word: "empathy",
    phonetic_uk: "/ˈem.pə.θi/",
    phonetic_us: "/ˈem.pə.θi/",
    part_of_speech: "noun",
    cefr_level: "B2",
    timestamp: Date.now() - 1000 * 60 * 60 * 40,
    is_favorite: false,
    meanings: [
      {
        pos: "noun",
        definition_vi: "Sự thấu cảm, khả năng thấu hiểu và sẻ chia cảm xúc của người khác",
        definition_en: "The ability to understand and share the feelings of another",
        examples: [
          {
            en: "A good leader must show empathy towards team members.",
            vi: "Một người lãnh đạo giỏi phải biết thể hiện sự thấu cảm đối với các thành viên trong nhóm."
          }
        ]
      }
    ],
    word_family: {
      noun: ["empathy"],
      verb: ["empathize"],
      adjective: ["empathetic", "empathic"],
      adverb: ["empathetically"]
    },
    synonyms: ["compassion", "sympathy", "understanding", "sensitivity"],
    antonyms: ["apathy", "indifference", "callousness"],
    collocations: [
      { phrase: "feel empathy for", meaning_vi: "cảm thấy thấu cảm với" },
      { phrase: "lack of empathy", meaning_vi: "sự thiếu thấu cảm" }
    ],
    memory_tip: "Em (bên trong) + pathy (cảm xúc) -> cảm nhận được cảm xúc từ tận bên trong người khác."
  },
  {
    word: "diligent",
    phonetic_uk: "/ˈdɪl.ɪ.dʒənt/",
    phonetic_us: "/ˈdɪl.ə.dʒənt/",
    part_of_speech: "adjective",
    cefr_level: "B2",
    timestamp: Date.now() - 1000 * 60 * 60 * 50,
    is_favorite: true,
    meanings: [
      {
        pos: "adjective",
        definition_vi: "Chăm chỉ, siêng năng, cần mẫn và chu đáo trong công việc",
        definition_en: "Having or showing care and conscientiousness in one's work or duties",
        examples: [
          {
            en: "She is a diligent student who always finishes her homework on time.",
            vi: "Cô ấy là một học sinh chăm chỉ luôn hoàn thành bài tập về nhà đúng hạn."
          }
        ]
      }
    ],
    word_family: {
      noun: ["diligence"],
      verb: [],
      adjective: ["diligent"],
      adverb: ["diligently"]
    },
    synonyms: ["industrious", "hardworking", "assiduous", "conscientious"],
    antonyms: ["lazy", "idle", "negligent"],
    collocations: [
      { phrase: "diligent effort", meaning_vi: "nỗ lực chăm chỉ" },
      { phrase: "diligent worker", meaning_vi: "người lao động cần mẫn" }
    ],
    memory_tip: "Người diligent làm việc 'đi liên tục' không ngơi nghỉ vì mục tiêu."
  },
  {
    word: "meticulous",
    phonetic_uk: "/məˈtɪk.jə.ləs/",
    phonetic_us: "/məˈtɪk.jə.ləs/",
    part_of_speech: "adjective",
    cefr_level: "C1",
    timestamp: Date.now() - 1000 * 60 * 60 * 60,
    is_favorite: false,
    meanings: [
      {
        pos: "adjective",
        definition_vi: "Tỉ mỉ, cẩn thận từng chi tiết nhỏ, chu đáo tuyệt đối",
        definition_en: "Showing great attention to detail; very careful and precise",
        examples: [
          {
            en: "The architect was meticulous in every calculation.",
            vi: "Vị kiến trúc sư vô cùng tỉ mỉ trong từng phép tính toán."
          }
        ]
      }
    ],
    word_family: {
      noun: ["meticulousness"],
      verb: [],
      adjective: ["meticulous"],
      adverb: ["meticulously"]
    },
    synonyms: ["thorough", "painstaking", "scrupulous", "precise"],
    antonyms: ["careless", "sloppy"],
    collocations: [
      { phrase: "meticulous planning", meaning_vi: "lên kế hoạch tỉ mỉ" },
      { phrase: "meticulous attention to detail", meaning_vi: "sự chú ý tỉ mỉ đến từng chi tiết" }
    ],
    memory_tip: "Meticulous nghe gần như 'tỉ mỉ tới từng milimet'."
  }
];

// Provide global access
window.SAMPLE_WORDS = SAMPLE_WORDS;
