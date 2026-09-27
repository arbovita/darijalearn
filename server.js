const express = require('express');
const cors = require('cors');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// LowDB setup
const adapter = new FileSync('db.json');
const db = low(adapter);

// Set default data
db.defaults({ darija: [], progress: { completedFlashcards: [], quizScores: [] } })
  .write();

// Darija data (same as frontend)
const DARIJA_DATA = [
  { id: 1, arabic: 'السلام', transliteration: 's-salam', english: 'Hello / Peace', audioUrl: 'https://example.com/audio/salam.mp3', category: 'greetings' },
  { id: 2, arabic: 'صباح الخير', transliteration: 'sbah l-khir', english: 'Good morning', audioUrl: 'https://example.com/audio/sbah.mp3', category: 'greetings' },
  { id: 3, arabic: 'شكرا', transliteration: 'shukran', english: 'Thank you', audioUrl: 'https://example.com/audio/shukran.mp3', category: 'expressions' },
  { id: 4, arabic: 'عفوا', transliteration: 'afwan', english: 'You\'re welcome / Excuse me', audioUrl: 'https://example.com/audio/afwan.mp3', category: 'expressions' },
  { id: 5, arabic: 'لا', transliteration: 'la', english: 'No', audioUrl: 'https://example.com/audio/la.mp3', category: 'basic' },
  { id: 6, arabic: 'نعم', transliteration: 'eyyeh', english: 'Yes', audioUrl: 'https://example.com/audio/eyyeh.mp3', category: 'basic' },
  { id: 7, arabic: 'كيف حالك؟', transliteration: 'kifak / kifik', english: 'How are you?', audioUrl: 'https://example.com/audio/kifak.mp3', category: 'greetings' },
  { id: 8, arabic: 'بخير، شكرا', transliteration: 'bkhir, shukran', english: 'Good, thanks', audioUrl: 'https://example.com/audio/bkhir.mp3', category: 'expressions' },
  { id: 9, arabic: 'ما هو اسمك؟', transliteration: 'shnu ismik?', english: 'What is your name?', audioUrl: 'https://example.com/audio/ismik.mp3', category: 'basic' },
  { id: 10, arabic: 'اسمي [...]', transliteration: 'ismi [...]', english: 'My name is [...]', audioUrl: 'https://example.com/audio/ismi.mp3', category: 'basic' }
];

// Initialize darija data if empty
if (db.get('darija').size().value() === 0) {
  db.set('darija', DARIJA_DATA).write();
}

// Routes
app.get('/api/darija', (req, res) => {
  const darija = db.get('darija').cloneDeep().value();
  res.json(darija);
});

app.get('/api/progress', (req, res) => {
  const progress = db.get('progress').value();
  // Convert completedFlashcards array back to Set for client convenience? We'll keep as array.
  res.json(progress);
});

app.post('/api/progress', (req, res) => {
  const { completedFlashcards, quizScores } = req.body;
  // Ensure completedFlashcards is an array (if coming from client as Set, we need to handle)
  const serializable = {
    completedFlashcards: Array.isArray(completedFlashcards) ? completedFlashcards : Array.from(completedFlashcards),
    quizScores: quizScores || []
  };
  db.set('progress', serializable).write();
  res.json(serializable);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});