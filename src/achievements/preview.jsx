import {useState} from 'react';
import {ChakraProvider, Button, Select, HStack, Box, SimpleGrid, Text} from '@chakra-ui/react';
import AchievementCollection from './AchievementCollection.jsx';
import AchievementOrb from './AchievementOrb.jsx';
import {SORTED_ACHIEVEMENTS, ACHIEVEMENT_LOCALES} from './catalog.js';
import {localizeAchievement} from './copy.js';
const unlocked={tutor_reach_a2:{unlockedAt:10,test:true},robotsbuildingeducation_solved_questions_10:{unlockedAt:10,test:true}};
const services={resolveEffectiveIdentity:()=>({npub:''}),getStoredAchievements:()=>unlocked,syncAchievements:async()=>unlocked,awardRandomAchievement:async()=>{const a=SORTED_ACHIEVEMENTS.find(a=>a.source==='nosabos'&&!unlocked[a.id]);if(!a)return null;unlocked[a.id]={unlockedAt:10,test:true};return a;}};
export default function Preview(){const [open,setOpen]=useState(true);const [language,setLanguage]=useState('en');return <ChakraProvider><Box p={5} color="white"><Text fontSize="sm" mb={3}>Visual preview · local sample data</Text><HStack mb={5}><Button onClick={()=>setOpen(true)}>Collection</Button><Select aria-label="Preview language" value={language} onChange={e=>setLanguage(e.target.value)}>{ACHIEVEMENT_LOCALES.map(l=><option key={l} value={l}>{l}</option>)}</Select></HStack><SimpleGrid columns={{base:3,md:9}} gap={3}>{SORTED_ACHIEVEMENTS.map(a=><Box key={a.id} bg="#192330" borderRadius="18px" p={2}><AchievementOrb achievement={a} size="100%"/><Text fontSize="10px">{a.number}. {localizeAchievement(a,language).title}</Text></Box>)}</SimpleGrid><AchievementCollection isOpen={open} onClose={()=>setOpen(false)} services={services} language={language}/></Box></ChakraProvider>};
