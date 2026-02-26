// ─────────────────────────────────────────────────────────────────────────────
// passages.js
//
// WHERE THE PASSAGES LIVE: right here, hardcoded.
//
// WHY HARDCODED (not a database, not a fetched JSON file):
//   - Passage text never changes at runtime — it's a fixed DepEd library
//   - Works fully offline with zero extra setup
//   - No fetch/async complexity in the components
//   - Adding a passage = paste text here, save, done
//   - The two helper functions at the bottom (findPassage, getAvailableGrades)
//     are the only interface the rest of the app uses, so nothing else
//     needs to change when you add more passages here
//
// HOW TO ADD A PASSAGE:
//   1. Copy any existing entry as a template
//   2. Fill in all fields
//   3. id must be unique — convention: 'fil-gr2-A', 'eng-gr5-B', etc.
//   4. Count totalWords carefully — it directly affects WPM and accuracy %
//   5. Save. Nothing else to do.
//
// PASSAGE SHAPE:
//   id          — unique string, e.g. 'fil-gr1-A'
//   language    — 'Filipino' | 'English'
//   gradeLevel  — 1–7  (number, not string)
//   set         — 'A' | 'B' | 'C' | 'D'
//   type        — 'narrative' (Gr 1–4) | 'expository' (Gr 5–7)
//   title       — shown to teacher on setup screen and PDF
//   text        — plain string, no HTML, whitespace-split into tokens
//   questions   — 5–8 comprehension questions per Phil-IRI spec
//   totalWords  — integer, pre-counted (used for WPM + word accuracy)
// ─────────────────────────────────────────────────────────────────────────────

export const PASSAGES = [
  // ── FILIPINO ──────────────────────────────────────────────────────────────

  {
    id: "fil-gr1-A",
    language: "Filipino",
    gradeLevel: 1,
    set: "A",
    type: "narrative",
    title: "Ang Aking Aso",
    text: `Mayroon akong aso. Aspin ang aking aso. Itim at puti ang kulay niya. Lagi siyang masaya. Tumatakbo siya sa bakuran. Gusto niyang maglaro. Inaalagaan ko ang aking aso. Binibigyan ko siya ng pagkain. Niligo ko rin siya. Mahal ko ang aking aso.`,
    questions: [
      { id: "q1", text: "Ano ang mayroon ang bata?", type: "literal" },
      { id: "q2", text: "Ano ang kulay ng aso?", type: "literal" },
      { id: "q3", text: "Saan tumatakbo ang aso?", type: "literal" },
      {
        id: "q4",
        text: "Paano inalagaan ng bata ang kanyang aso?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Bakit mahalaga ang mag-alaga ng hayop?",
        type: "inferential",
      },
    ],
    totalWords: 52,
  },

  {
    id: "fil-gr2-A",
    language: "Filipino",
    gradeLevel: 2,
    set: "A",
    type: "narrative",
    title: "Ang Palengke",
    text: `Pumunta kami sa palengke kasama ang aking nanay. Maraming tao ang nasa palengke. Makukulay ang mga gulay at prutas. Nakita namin ang mga kamatis, sitaw, at talong. Mayroon ding mangga at saging. Bumili ang aking nanay ng mga kailangan namin. Nagbayad siya sa tindera. Masaya akong tumulong sa pagdadala ng aming binili. Pagkagaling namin sa palengke, nagluto na ang nanay ng masarap na ulam.`,
    questions: [
      {
        id: "q1",
        text: "Saan pumunta ang bata at ang kanyang nanay?",
        type: "literal",
      },
      {
        id: "q2",
        text: "Ano-ano ang mga gulay na nakita nila?",
        type: "literal",
      },
      {
        id: "q3",
        text: "Ano ang ginawa ng nanay sa palengke?",
        type: "literal",
      },
      { id: "q4", text: "Paano tumulong ang bata?", type: "literal" },
      {
        id: "q5",
        text: "Bakit mahalaga ang palengke sa isang komunidad?",
        type: "inferential",
      },
    ],
    totalWords: 79,
  },

  {
    id: "fil-gr3-A",
    language: "Filipino",
    gradeLevel: 3,
    set: "A",
    type: "narrative",
    title: "Ang Aking Pamilya",
    text: `Mayroon akong masayang pamilya. Kami ay nakatira sa isang maliit na bahay sa probinsya. Ang aking ama ay magsasaka. Araw-araw, pumupunta siya sa bukid upang mag-araro at magtanim. Ang aking ina naman ay nag-aalaga ng aming tahanan. Nagluluto siya ng masarap na pagkain para sa amin. Mayroon akong dalawang kapatid. Ang aking kuya ay nag-aaral sa ikatlong baitang. Ang aking bunso ay dalawang taong gulang pa lamang. Tuwing hapon, naglalaro kami sa aming bakuran. Masaya kaming magkakasama bilang isang pamilya.`,
    questions: [
      { id: "q1", text: "Saan nakatira ang pamilya?", type: "literal" },
      { id: "q2", text: "Ano ang trabaho ng ama?", type: "literal" },
      {
        id: "q3",
        text: "Ilang kapatid ang mayroon ang bata?",
        type: "literal",
      },
      {
        id: "q4",
        text: "Ano ang ginagawa nila tuwing hapon?",
        type: "literal",
      },
      { id: "q5", text: "Bakit masaya ang pamilya?", type: "inferential" },
    ],
    totalWords: 93,
  },

  {
    id: "fil-gr4-A",
    language: "Filipino",
    gradeLevel: 4,
    set: "A",
    type: "narrative",
    title: "Ang Bayani ng Aming Barangay",
    text: `Si Mang Andres ay isang guro sa aming barangay. Siya ay marunong at mabait. Sa loob ng tatlumpung taon, nagturo siya ng maraming bata sa aming lugar. Kahit matanda na siya, patuloy pa rin siyang naglilingkod sa mga kabataan. Tuwing Sabado, nagbibigay siya ng libreng klase sa mga batang hindi makapasok sa paaralan. Gumagawa rin siya ng mga libro at kagamitang panturo para sa kanyang mga mag-aaral. Dahil sa kanyang pagmamahal sa edukasyon, marami sa kanyang mga dati nang estudyante ay naging matagumpay na propesyonal. Itinuturing siya ng aming komunidad bilang tunay na bayani ng aming barangay.`,
    questions: [
      { id: "q1", text: "Sino si Mang Andres?", type: "literal" },
      { id: "q2", text: "Gaano katagal na siyang nagtuturo?", type: "literal" },
      {
        id: "q3",
        text: "Ano ang ginagawa niya tuwing Sabado?",
        type: "literal",
      },
      {
        id: "q4",
        text: "Ano ang naging bunga ng kanyang pagiging guro?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Bakit siya tinatawag na bayani ng barangay?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "Ano sa palagay mo ang pinakamahalagang katangian ni Mang Andres? Bakit?",
        type: "critical",
      },
    ],
    totalWords: 112,
  },

  {
    id: "fil-gr5-A",
    language: "Filipino",
    gradeLevel: 5,
    set: "A",
    type: "expository",
    title: "Ang Kahalagahan ng Tubig",
    text: `Ang tubig ay isa sa pinakamahalagang sangkap sa ating katawan. Halos pitumpung porsyento ng ating katawan ay binubuo ng tubig. Ginagamit natin ang tubig para sa pag-inom, pagligo, pagluluto, at paglilinis. Hindi tayo mabubuhay nang wala ito nang higit sa tatlong araw. Bukod dito, ang tubig ay mahalaga rin sa agrikultura. Ginagamit ito sa pagdidilig ng mga pananim upang lumaki at lumago. Sa industriya, ginagamit ang tubig sa paggawa ng iba't ibang produkto. Ngunit sa kabila ng kahalagahan nito, maraming lugar sa mundo ang naghihirap sa kakulangan ng malinis na tubig. Kaya naman, mahalaga na pangalagaan at panatilihing malinis ang ating mga pinagkukunan ng tubig para sa susunod na henerasyon.`,
    questions: [
      {
        id: "q1",
        text: "Ilang porsyento ng ating katawan ang binubuo ng tubig?",
        type: "literal",
      },
      {
        id: "q2",
        text: "Para saan ginagamit ang tubig sa agrikultura?",
        type: "literal",
      },
      {
        id: "q3",
        text: "Gaano katagal na mabubuhay ang tao nang walang tubig?",
        type: "literal",
      },
      {
        id: "q4",
        text: "Ano ang problema ng maraming lugar tungkol sa tubig?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Bakit mahalagang pangalagaan ang ating pinagkukunan ng tubig?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "Ano ang maaari mong gawin upang makatulong sa pangangalaga ng tubig?",
        type: "critical",
      },
    ],
    totalWords: 130,
  },

  {
    id: "fil-gr6-A",
    language: "Filipino",
    gradeLevel: 6,
    set: "A",
    type: "expository",
    title: "Ang Pagbabago ng Klima",
    text: `Ang pagbabago ng klima ay isa sa pinakamalaking hamon na kinakaharap ng ating mundo ngayon. Ito ay tumutukoy sa pangmatagalang pagbabago sa temperatura at mga kalagayan ng panahon sa ating planeta. Ang pangunahing sanhi nito ay ang pagtaas ng greenhouse gases sa atmospera, na kadalasang nagmumula sa pagsusunog ng fossil fuels tulad ng karbon at langis. Ang mga epekto ng pagbabago ng klima ay nakikita na sa iba't ibang panig ng mundo. Tumataas ang antas ng dagat, nagiging mas madalas ang mga bagyo at baha, at nagsisimulang mawala ang ilang mga species ng halaman at hayop. Sa Pilipinas, isa sa mga bansang pinaka-apektado ng pagbabago ng klima, nakararanas tayo ng mas matitinding bagyo at mas matagal na tag-init. Upang matugunan ang problemang ito, kailangan ng sama-samang pagsisikap ng lahat ng bansa sa buong mundo.`,
    questions: [
      {
        id: "q1",
        text: "Ano ang ibig sabihin ng pagbabago ng klima?",
        type: "literal",
      },
      {
        id: "q2",
        text: "Ano ang pangunahing sanhi ng pagbabago ng klima?",
        type: "literal",
      },
      {
        id: "q3",
        text: "Ano-ano ang mga epekto ng pagbabago ng klima?",
        type: "literal",
      },
      {
        id: "q4",
        text: "Paano naapektuhan ang Pilipinas ng pagbabago ng klima?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Bakit kailangan ng sama-samang pagsisikap upang malutas ang pagbabago ng klima?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "Bilang isang kabataan, ano ang iyong responsibilidad sa problemang ito?",
        type: "critical",
      },
    ],
    totalWords: 148,
  },

  {
    id: "fil-gr7-A",
    language: "Filipino",
    gradeLevel: 7,
    set: "A",
    type: "expository",
    title: "Ang Wikang Filipino sa Makabagong Panahon",
    text: `Ang wikang Filipino ay nagsisilbing pangunahing wikang panturo at opisyal na wika ng ating bansa. Sa kabila ng paglaganap ng modernong teknolohiya at impluwensya ng mga dayuhang wika, nananatiling malakas at buhay ang Filipino bilang simbolo ng ating pambansang pagkakakilanlan. Sa kasalukuyan, lumalawak ang gamit ng wikang Filipino sa iba't ibang larangan tulad ng media, negosyo, at internet. Maraming Filipino ang gumagamit ng Taglish o halo-halong Filipino at Ingles sa pang-araw-araw na komunikasyon, na nagpapakita ng kakayahang mag-angkop ng ating wika sa pagbabago ng panahon. Gayunpaman, may pag-aalala ang ilang eksperto na maaaring mapalitan ng Ingles ang Filipino bilang dominanteng wika sa ating lipunan. Upang mapanatili ang ating wika, mahalaga na itaguyod ang paggamit nito sa lahat ng aspeto ng ating buhay, mula sa tahanan hanggang sa paaralan at sa komunidad.`,
    questions: [
      {
        id: "q1",
        text: "Ano ang papel ng wikang Filipino sa ating bansa?",
        type: "literal",
      },
      { id: "q2", text: "Ano ang Taglish?", type: "literal" },
      {
        id: "q3",
        text: "Sa anong mga larangan lumalawak ang gamit ng Filipino?",
        type: "literal",
      },
      {
        id: "q4",
        text: "Ano ang pag-aalala ng mga eksperto tungkol sa wikang Filipino?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Bakit mahalaga ang pagpapanatili ng wikang Filipino?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "Sa iyong palagay, paano mo mapananatili ang wikang Filipino sa iyong pang-araw-araw na buhay?",
        type: "critical",
      },
      {
        id: "q7",
        text: "Ano ang relasyon ng wika at pagkakakilanlan ng isang tao o bansa?",
        type: "critical",
      },
    ],
    totalWords: 162,
  },

  // ── ENGLISH ──────────────────────────────────────────────────────────────

  {
    id: "eng-gr2-A",
    language: "English",
    gradeLevel: 2,
    set: "A",
    type: "narrative",
    title: "A Rainy Day",
    text: `It was raining hard outside. Ana could not go out to play. She sat by the window and watched the rain fall. The streets were wet and puddles formed on the ground. Her mother called her to the kitchen. They made hot chocolate together. The sweet smell filled the house. Ana felt warm and happy. After the rain, a beautiful rainbow appeared in the sky. Ana ran outside to see it. It was the best part of the rainy day.`,
    questions: [
      { id: "q1", text: "Why could Ana not go out to play?", type: "literal" },
      {
        id: "q2",
        text: "What did Ana and her mother make together?",
        type: "literal",
      },
      {
        id: "q3",
        text: "What appeared in the sky after the rain?",
        type: "literal",
      },
      {
        id: "q4",
        text: "How did Ana feel while making hot chocolate?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Why was the rainbow the best part of the rainy day?",
        type: "inferential",
      },
    ],
    totalWords: 91,
  },

  {
    id: "eng-gr3-A",
    language: "English",
    gradeLevel: 3,
    set: "A",
    type: "narrative",
    title: "My Best Friend",
    text: `I have a best friend named Maria. We have been friends since we were in Grade One. Maria lives near our house so we walk to school together every day. She has long black hair and a bright smile. Maria is very kind and helpful. When I do not understand my lessons, she explains them to me. We eat lunch together in the canteen. After school, we do our homework side by side. On weekends, we play in the park near her house. I am happy to have a friend like Maria.`,
    questions: [
      {
        id: "q1",
        text: "What is the narrator's best friend's name?",
        type: "literal",
      },
      { id: "q2", text: "Since when have they been friends?", type: "literal" },
      {
        id: "q3",
        text: "What does Maria do when the narrator does not understand lessons?",
        type: "literal",
      },
      { id: "q4", text: "What do they do on weekends?", type: "literal" },
      {
        id: "q5",
        text: "Why do you think they are good friends?",
        type: "inferential",
      },
    ],
    totalWords: 97,
  },

  {
    id: "eng-gr4-A",
    language: "English",
    gradeLevel: 4,
    set: "A",
    type: "narrative",
    title: "The Old Mango Tree",
    text: `Behind our school stands a very old mango tree. Nobody knows exactly how old it is, but our teachers say it was already there when they were students. The tree is very tall and its branches spread wide, giving shade to the whole corner of the yard. During recess, the children gather under it to eat their snacks and play games. In summer, the tree is full of sweet yellow mangoes. The older students climb up carefully to pick the fruit. The younger ones wait below with their hands out. Our principal says we must always take care of the tree because it is part of our school's history.`,
    questions: [
      {
        id: "q1",
        text: "Where is the old mango tree located?",
        type: "literal",
      },
      {
        id: "q2",
        text: "What do children do under the tree during recess?",
        type: "literal",
      },
      {
        id: "q3",
        text: "What happens to the tree in summer?",
        type: "literal",
      },
      {
        id: "q4",
        text: "Why does the principal say they must take care of the tree?",
        type: "literal",
      },
      {
        id: "q5",
        text: "What does the tree mean to the school community?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "How do you think the students feel about the mango tree? Why?",
        type: "critical",
      },
    ],
    totalWords: 121,
  },

  {
    id: "eng-gr5-A",
    language: "English",
    gradeLevel: 5,
    set: "A",
    type: "expository",
    title: "The Importance of Reading",
    text: `Reading is one of the most important skills a person can develop. It opens doors to knowledge, imagination, and understanding of the world. When we read, we learn new words and ideas that help us communicate better with others. Studies show that children who read regularly perform better in school across all subjects, not just in language arts. Reading also strengthens the brain. When we follow a story or understand complex information, our brains form new connections that improve memory and critical thinking. Beyond academics, reading for pleasure reduces stress and helps people develop empathy by experiencing life through the eyes of different characters. Despite these benefits, many young people today spend less time reading and more time on screens. Building a reading habit early in life is one of the greatest gifts a person can give to themselves.`,
    questions: [
      {
        id: "q1",
        text: "What does reading help us do when communicating with others?",
        type: "literal",
      },
      { id: "q2", text: "How does reading affect the brain?", type: "literal" },
      {
        id: "q3",
        text: "What does reading for pleasure help reduce?",
        type: "literal",
      },
      {
        id: "q4",
        text: "What trend among young people does the passage mention?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Why do students who read perform better across all subjects?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "Do you agree that building a reading habit is a gift to yourself? Explain.",
        type: "critical",
      },
    ],
    totalWords: 152,
  },

  {
    id: "eng-gr6-A",
    language: "English",
    gradeLevel: 6,
    set: "A",
    type: "expository",
    title: "Coral Reefs: The Rainforests of the Sea",
    text: `Coral reefs are among the most diverse and valuable ecosystems on Earth. Often called the rainforests of the sea, they cover less than one percent of the ocean floor yet support approximately twenty-five percent of all marine species. Coral reefs provide food and shelter for thousands of fish, invertebrates, and other sea creatures. They also protect coastlines from the damaging effects of waves and tropical storms. For millions of people around the world, coral reefs are a source of food, income from tourism and fishing, and ingredients for medicines. Despite their importance, coral reefs are under serious threat. Rising ocean temperatures caused by climate change lead to coral bleaching, a process where corals expel the algae living in their tissues and turn white. Without the algae, the corals can die. Pollution, overfishing, and destructive fishing practices also damage reefs. Scientists warn that without urgent action, much of the world's coral reefs could be lost within decades.`,
    questions: [
      {
        id: "q1",
        text: "What percentage of marine species do coral reefs support?",
        type: "literal",
      },
      {
        id: "q2",
        text: "How do coral reefs protect coastlines?",
        type: "literal",
      },
      { id: "q3", text: "What is coral bleaching?", type: "literal" },
      {
        id: "q4",
        text: "What human activities damage coral reefs?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Why are coral reefs compared to rainforests?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "What will happen to communities that depend on coral reefs if reefs are lost?",
        type: "critical",
      },
      {
        id: "q7",
        text: "What actions can individuals and governments take to protect coral reefs?",
        type: "critical",
      },
    ],
    totalWords: 178,
  },

  {
    id: "eng-gr7-A",
    language: "English",
    gradeLevel: 7,
    set: "A",
    type: "expository",
    title: "Artificial Intelligence and the Future of Work",
    text: `Artificial intelligence, or AI, refers to computer systems that can perform tasks that normally require human intelligence, such as recognizing speech, making decisions, and translating languages. In recent years, AI has advanced rapidly and is now reshaping many industries. In manufacturing, robots powered by AI can assemble products faster and more accurately than human workers. In healthcare, AI systems can analyze medical images to detect diseases earlier than trained doctors. In finance, algorithms make thousands of investment decisions per second. These developments raise an important question: will AI take away jobs from humans? Economists are divided on this issue. Some argue that AI will eliminate many existing jobs, particularly those involving routine tasks. Others believe that AI will create new jobs and industries that we cannot yet imagine, just as previous technological revolutions did. History shows that while technology displaces some workers, it also creates new forms of employment. However, the transition can be painful for those whose skills become obsolete. Preparing for an AI-powered future requires investing in education and training so that workers can adapt to changing demands.`,
    questions: [
      { id: "q1", text: "What is artificial intelligence?", type: "literal" },
      { id: "q2", text: "How is AI used in healthcare?", type: "literal" },
      {
        id: "q3",
        text: "What types of jobs are most at risk from AI?",
        type: "literal",
      },
      {
        id: "q4",
        text: "What does history show about the effect of technology on employment?",
        type: "literal",
      },
      {
        id: "q5",
        text: "Why are economists divided on whether AI will take away jobs?",
        type: "inferential",
      },
      {
        id: "q6",
        text: "What does the author suggest is needed to prepare for an AI-powered future?",
        type: "inferential",
      },
      {
        id: "q7",
        text: "Do you think the benefits of AI outweigh the risks? Support your answer with evidence from the text.",
        type: "critical",
      },
    ],
    totalWords: 196,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper functions
// These are the ONLY things the rest of the app imports from this file.
// Adding more entries to PASSAGES above automatically affects all of these.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Find a passage by language, grade level, and set.
 * Returns null if not found — PassagePage handles that case gracefully.
 */
export function findPassage(language, gradeLevel, set = "A") {
  return (
    PASSAGES.find(
      (p) =>
        p.language === language && p.gradeLevel === gradeLevel && p.set === set,
    ) ?? null
  );
}

/**
 * Get all grade levels that have at least one passage for a given language.
 * Used to populate the grade selector buttons in the setup screen.
 */
export function getAvailableGrades(language) {
  return [
    ...new Set(
      PASSAGES.filter((p) => p.language === language).map((p) => p.gradeLevel),
    ),
  ].sort((a, b) => a - b);
}
