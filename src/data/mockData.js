export const DEFAULT_CLASS = 'Class 9B';
export const DEFAULT_SUBJECT = 'Biology';

export const SAMPLE_CSV = `student_id,question_id,response,correct
S001,Q1,B,false
S002,Q1,A,true
S003,Q1,B,false
S004,Q1,A,true
S005,Q1,C,false`;

export const LOADING_STEPS = [
  'Uploading quiz data to Elasticsearch...',
  'Running semantic search for misconception patterns...',
  'Generating differentiated re-teaching plan...',
];

export const learningGaps = [
  {
    id: 1,
    title: 'Light Reactions of Photosynthesis',
    strugglingCount: 18,
    totalStudents: 30,
    misconception:
      'Students believe chlorophyll directly produces oxygen rather than splitting water molecules.',
    activities: {
      struggling: {
        title: 'Draw & Label',
        bullets: [
          'Provide a half-completed diagram of the light reaction on handouts.',
          'Students fill in ATP, NADPH, and O₂ labels with a partner.',
          'Use color coding: blue for inputs, green for outputs.',
          'Circulate and ask: "Where does the oxygen actually come from?"',
        ],
      },
      onTrack: {
        title: 'Flashcard Sort',
        bullets: [
          'Match inputs/outputs of light reactions on index cards independently.',
          'Compare sorted piles with a peer and resolve disagreements.',
          'Add one real-world example (e.g., pond plants at midday).',
          'Quick 3-question exit ticket on electron flow.',
        ],
      },
      advanced: {
        title: 'Research Challenge',
        bullets: [
          'Compare cyclic vs non-cyclic photophosphorylation using textbook or tablet.',
          'Create a 3-slide mini-presentation for the class.',
          'Include one diagram and one "so what?" for agriculture.',
          'Peer review using a 2-star, 1-wish protocol.',
        ],
      },
    },
  },
  {
    id: 2,
    title: 'Role of Stomata in Gas Exchange',
    strugglingCount: 9,
    totalStudents: 30,
    misconception:
      'Students confuse stomata with chloroplasts and think they produce glucose during gas exchange.',
    activities: {
      struggling: {
        title: 'Stomata Micro-Model',
        bullets: [
          'Build a paper "leaf cross-section" with open/close stomata flaps.',
          'Label guard cells, air spaces, and direction of CO₂ vs O₂.',
          'Role-play: one student is CO₂ entering during the day.',
          'Sketch what changes at night on the back of the handout.',
        ],
      },
      onTrack: {
        title: 'Data Table & Graph',
        bullets: [
          'Plot stomatal opening rate vs time of day from provided data.',
          'Explain the pattern in two complete sentences.',
          'Link opening to photosynthesis rate in a short paragraph.',
          'Exchange graphs with a partner for one improvement suggestion.',
        ],
      },
      advanced: {
        title: 'Design an Investigation',
        bullets: [
          'Propose how to test stomatal density on sun vs shade leaves.',
          'List variables, controls, and expected outcome.',
          'Predict impact on transpiration in a drought scenario.',
          'Present hypothesis to a small group for feedback.',
        ],
      },
    },
  },
  {
    id: 3,
    title: 'Calvin Cycle vs Light Reactions',
    strugglingCount: 7,
    totalStudents: 30,
    misconception:
      'Students think the Calvin cycle happens in the thylakoid and produces oxygen like the light reactions.',
    activities: {
      struggling: {
        title: 'Two-Chamber Diagram',
        bullets: [
          'Split paper into "Thylakoid" and "Stroma" chambers.',
          'Place process cards (light reactions vs Calvin cycle) in correct chamber.',
          'Draw arrows for energy (ATP/NADPH) moving between chambers.',
          'Verbal checkpoint: name one product of each stage.',
        ],
      },
      onTrack: {
        title: 'Venn Comparison',
        bullets: [
          'Complete a Venn diagram: location, inputs, outputs, energy needs.',
          'Write one analogy (e.g., factory floor vs power plant).',
          'Answer: "Why must light reactions run before the Calvin cycle?"',
          'Share analogies in pairs; pick the clearest for the class.',
        ],
      },
      advanced: {
        title: 'Carbon Fixation Deep Dive',
        bullets: [
          'Trace the path of one CO₂ molecule to G3P in bullet steps.',
          'Compare C3, C4, and CAM plants in a comparison table.',
          'Evaluate which pathway fits a desert succulent and why.',
          'Optional extension: read about Rubisco and summarize in 2 sentences.',
        ],
      },
    },
  },
];

export function buildExportMarkdown(className, subject) {
  const header = `# Re-Teaching Plan — ${className} ${subject}\n\n**Approved** · 3 learning gaps · 18/30 students affected (primary gap)\n\n---\n\n`;

  const sections = learningGaps
    .map((gap) => {
      const pct = Math.round((gap.strugglingCount / gap.totalStudents) * 100);
      return `## ${gap.title}\n\n*${gap.misconception}*\n\n**${gap.strugglingCount}/${gap.totalStudents} students struggling** (${pct}%)\n\n### Struggling learners — ${gap.activities.struggling.title}\n${gap.activities.struggling.bullets.map((b) => `- ${b}`).join('\n')}\n\n### On-track learners — ${gap.activities.onTrack.title}\n${gap.activities.onTrack.bullets.map((b) => `- ${b}`).join('\n')}\n\n### Advanced learners — ${gap.activities.advanced.title}\n${gap.activities.advanced.bullets.map((b) => `- ${b}`).join('\n')}\n`;
    })
    .join('\n---\n\n');

  return header + sections + '\n---\n\n*Generated by GapFinder · Elasticsearch + Gemini 3 Flash*';
}
