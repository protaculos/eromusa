"use client";

import { useState } from "react";
import VideoCreateModal from "@/components/video/VideoCreateModal";
import TemplateCard from "@/components/video/TemplateCard";
import { useSettings } from "@/context/SettingsContext";
import LoginModal from "@/components/LoginModal";

interface Template {
  id: string;
  title: string;
  thumbnail: string;
  isFree: boolean;
  isPopular: boolean;
  tags: string[];
  videoUrl: string;
  gradient: string;
  duration: string;
  credits: number;
  instructions: string[];
  styleId: string;
}

const gradients = [
  "from-orange-500 via-pink-500 to-purple-600",
  "from-cyan-400 via-blue-500 to-purple-600",
  "from-amber-500 via-orange-500 to-rose-600",
  "from-gray-600 via-gray-500 to-zinc-700",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-yellow-400 via-amber-500 to-orange-500",
  "from-slate-700 via-gray-600 to-zinc-800",
  "from-fuchsia-500 via-pink-500 to-rose-600",
  "from-red-500 via-orange-500 to-yellow-500",
  "from-teal-400 via-cyan-500 to-blue-600",
  "from-purple-500 via-pink-500 to-red-500",
  "from-green-400 via-emerald-500 to-teal-600",
];

const allTemplates: Template[] = [
  { id: "1", title: "Undress V2", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: true, tags: ["Undress", "Sexy"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Full body photo preferred", "Good lighting on body", "Standing pose works best", "Avoid loose clothing"], styleId: "i2v-undress-v2" },
  { id: "2", title: "Blowjob V2", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: true, tags: ["Blowjob", "Oral"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Face photo preferred", "Open mouth expression", "Look at camera", "Good lighting on face"], styleId: "blowjob-v2" },
  { id: "3", title: "POV CowGirl V2", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: true, tags: ["Cowgirl", "Riding"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Full body photo", "Confident pose", "Good lighting", "Natural expression"], styleId: "pov-cowgirl-v2" },
  { id: "4", title: "Ass Spread V2", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: false, tags: ["Ass", "Spread"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Back view photo", "Bent over pose", "Good lighting on body", "Minimal clothing"], styleId: "ass-spread-v2" },
  { id: "5", title: "Missionary", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: true, tags: ["Missionary", "Sex"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down pose", "Legs visible", "Relaxed expression"], styleId: "missionary" },
  { id: "6", title: "Airblow", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/feet_show.webp", isFree: false, isPopular: false, tags: ["Airblow", "Fantasy"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 20, instructions: ["Face photo preferred", "Open mouth", "Side profile works", "Good lighting"], styleId: "airblow" },
  { id: "7", title: "BBC Deepthroat", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: true, tags: ["Deepthroat", "BBC"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Face close-up", "Open mouth wide", "Look up at camera", "Good lighting on face"], styleId: "bbc-deepthroat" },
  { id: "8", title: "Cum in Mouth", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/posing_naked.webp", isFree: false, isPopular: false, tags: ["Cum", "Facial"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 30, instructions: ["Face photo", "Open mouth", "Tongue out", "Look at camera"], styleId: "cum-in-mouth" },
  { id: "9", title: "Ahegao", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: true, tags: ["Ahegao", "Face"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 20, instructions: ["Face close-up", "Eyes rolled back", "Tongue out", "Extreme expression"], styleId: "ahegao" },
  { id: "10", title: "Dildo Handjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/posing_naked.webp", isFree: false, isPopular: false, tags: ["Dildo", "Handjob"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 20, instructions: ["Full body photo", "Hand near crotch", "Sitting or lying", "Good lighting"], styleId: "dildo-handjob" },
  { id: "11", title: "Footjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Footjob", "Feet"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 30, instructions: ["Feet visible photo", "Legs extended", "Sitting or lying", "Feet well lit"], styleId: "footjob" },
  { id: "12", title: "Creampie", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: true, tags: ["Creampie", "Sex"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs spread", "Relaxed pose"], styleId: "creampie" },
  { id: "13", title: "Facial V2", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: true, tags: ["Facial", "Cum"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Face close-up", "Eyes closed", "Mouth slightly open", "Good lighting"], styleId: "facial-v2" },
  { id: "14", title: "Reverse Cowgirl POV", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/pov_blowjob.webp", isFree: false, isPopular: false, tags: ["Reverse", "Cowgirl"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Back view photo", "Sitting pose", "Hair visible", "Good lighting"], styleId: "reverse-cowgirl-pov" },
  { id: "15", title: "Cumshot Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cum_mouth.webp", isFree: false, isPopular: false, tags: ["Cumshot", "Blowjob"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Face photo", "Open mouth", "Look at camera", "Good lighting on face"], styleId: "cumshot-blowjob" },
  { id: "16", title: "Jack O Pose", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Jack", "Pose"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 20, instructions: ["Full body photo", "Standing pose", "Arms visible", "Good lighting"], styleId: "jack-o-pose" },
  { id: "17", title: "Posing Naked", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: true, tags: ["Posing", "Naked"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Full body photo", "Standing or sitting", "Confident pose", "Good lighting"], styleId: "posing-naked" },
  { id: "18", title: "POV Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: true, tags: ["POV", "Blowjob"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 30, instructions: ["Face photo", "Looking up", "Mouth open", "Good lighting"], styleId: "pov-blowjob" },
  { id: "19", title: "Hiding Naked", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/multiple-facials.webp", isFree: false, isPopular: false, tags: ["Hiding", "Naked"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Full body photo", "Shy pose", "Arms covering", "Good lighting"], styleId: "hiding-naked" },
  { id: "20", title: "Feet Show", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Feet", "Show"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 30, instructions: ["Feet photo", "Legs extended", "Sitting pose", "Feet well lit"], styleId: "feet-show" },
  { id: "21", title: "Shoejob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["Shoejob", "Feet"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 20, instructions: ["Feet with shoes", "Legs extended", "Sitting pose", "Good lighting"], styleId: "shoejob" },
  { id: "22", title: "Pussy Play", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: true, tags: ["Pussy", "Play"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs spread", "Hand near crotch"], styleId: "pussy-play" },
  { id: "23", title: "Doggy V2", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/hiding_naked.webp", isFree: false, isPopular: true, tags: ["Doggy", "Sex"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 30, instructions: ["Back view photo", "Bent over", "On all fours", "Good lighting"], styleId: "doggy-v2" },
  { id: "24", title: "Kissing POV", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: false, tags: ["Kissing", "POV"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 20, instructions: ["Face close-up", "Lips pursed", "Looking at camera", "Good lighting"], styleId: "kissing-pov" },
  { id: "25", title: "Spitting POV", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/feet_show.webp", isFree: false, isPopular: false, tags: ["Spitting", "POV"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 20, instructions: ["Face photo", "Mouth open", "Spitting expression", "Good lighting"], styleId: "spitting-pov" },
  { id: "26", title: "Undress Close up POV Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Undress", "Blowjob"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 60, instructions: ["Face close-up", "Open mouth", "Looking up", "Good lighting"], styleId: "undress-close-up-pov-blowjob" },
  { id: "27", title: "Posing Ass Spread", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/feet_show.webp", isFree: false, isPopular: false, tags: ["Ass", "Spread"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 60, instructions: ["Back view photo", "Bent over", "Legs spread", "Good lighting"], styleId: "posing-ass-spread" },
  { id: "28", title: "Gear Shift Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Gear", "Shift"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Full body photo", "Standing pose", "Bent forward", "Good lighting"], styleId: "gear-shift-fuck" },
  { id: "29", title: "Sitting on Dick", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: true, tags: ["Sitting", "Dick"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Full body photo", "Sitting pose", "Looking down", "Good lighting"], styleId: "sit-on-dick" },
  { id: "30", title: "Morning Wood", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Morning", "Wood"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying in bed", "Sleepy expression", "Good lighting"], styleId: "morning-wood" },
  { id: "31", title: "Multiple Facials", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Facials", "Cum"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Face photo", "Eyes closed", "Mouth open", "Good lighting"], styleId: "multiple-facials" },
  { id: "32", title: "POV Blowjob Cum in Mouth", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Blowjob", "Cum"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 60, instructions: ["Face close-up", "Open mouth wide", "Looking up", "Good lighting"], styleId: "pov-blowjob-cum-in-mouth" },
  { id: "33", title: "Missionary Creampie", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: true, tags: ["Missionary", "Creampie"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 60, instructions: ["Full body photo", "Lying down", "Legs spread", "Relaxed expression"], styleId: "missionary-creampie" },
  { id: "34", title: "Upskirt Walk", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Upskirt", "Walk"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 30, instructions: ["Full body photo", "Walking pose", "Skirt/dress", "Good lighting"], styleId: "posing-naked-jack-o-pose" },
  { id: "35", title: "Pussy Rubbing Creampie", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Pussy", "Creampie"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 60, instructions: ["Full body photo", "Lying down", "Hand near crotch", "Good lighting"], styleId: "pussy-rubbing-creampie" },
  { id: "36", title: "BBC Blowjob Cumshot", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["BBC", "Cumshot"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 60, instructions: ["Face close-up", "Open mouth", "Looking up", "Good lighting"], styleId: "bbc-blowjob-cumshot" },
  { id: "37", title: "69 Deepthroat", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["69", "Deepthroat"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Face photo", "Open mouth wide", "Looking up", "Good lighting"], styleId: "69-deep throath" },
  { id: "38", title: "Full Nelson", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["Full", "Nelson"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Full body photo", "Arms behind back", "Bent forward", "Good lighting"], styleId: "full-nelson" },
  { id: "39", title: "Sideways Sex", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/posing_naked.webp", isFree: false, isPopular: false, tags: ["Sideways", "Sex"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying on side", "Legs visible", "Good lighting"], styleId: "sideways-sex" },
  { id: "40", title: "Titfuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Titfuck", "Boobs"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Upper body photo", "Boobs visible", "Lying or sitting", "Good lighting"], styleId: "titfuck" },
  { id: "41", title: "Cum on Body Missionary", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Cum", "Body"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Body visible", "Good lighting"], styleId: "cum-on-body-missionary" },
  { id: "42", title: "BBC Spit Roast", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["BBC", "Spit"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 30, instructions: ["Full body photo", "On all fours", "Face and body visible", "Good lighting"], styleId: "bbc-spit-roast" },
  { id: "43", title: "Regret", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Regret", "Emotion"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Face photo", "Sad expression", "Looking away", "Good lighting"], styleId: "regret" },
  { id: "44", title: "Dick Enjoyment", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: false, tags: ["Dick", "Enjoyment"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 30, instructions: ["Face photo", "Happy expression", "Looking at camera", "Good lighting"], styleId: "dick-enjoyment" },
  { id: "45", title: "Eyes Up Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Eyes", "Blowjob"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 30, instructions: ["Face photo", "Eyes looking up", "Mouth open", "Good lighting"], styleId: "eyes-up-blowjob" },
  { id: "46", title: "Pregnant Sex", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Pregnant", "Sex"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 30, instructions: ["Full body photo", "Pregnant belly", "Lying or sitting", "Good lighting"], styleId: "pregnant-sex" },
  { id: "47", title: "Pregnant Undressing", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Pregnant", "Undress"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 30, instructions: ["Full body photo", "Pregnant belly", "Undressing pose", "Good lighting"], styleId: "pregnant-undressing" },
  { id: "48", title: "Pregnant Lactation", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Pregnant", "Lactation"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 30, instructions: ["Upper body photo", "Pregnant belly", "Boobs visible", "Good lighting"], styleId: "pregnant-lactation" },
  { id: "49", title: "Squirting With Vibrator", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Squirting", "Vibrator"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs spread", "Good lighting"], styleId: "squirting-with-vibrator" },
  { id: "50", title: "BBC Glory Hole", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["BBC", "Glory"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Face photo", "Open mouth", "Kneeling pose", "Good lighting"], styleId: "bbc-glory-hole" },
  { id: "51", title: "Cock on Face", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Cock", "Face"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Face close-up", "Eyes closed", "Mouth open", "Good lighting"], styleId: "cock-on-face" },
  { id: "52", title: "Missionary BBC", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cum_mouth.webp", isFree: false, isPopular: false, tags: ["Missionary", "BBC"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs up", "Good lighting"], styleId: "missionary-bbc" },
  { id: "53", title: "XXL Black Dildo Deepthroat", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["Dildo", "Deepthroat"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Face close-up", "Mouth wide open", "Looking up", "Good lighting"], styleId: "xxl-black-dildo-deepthroat" },
  { id: "54", title: "Arch Sucking", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: false, tags: ["Arch", "Sucking"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 30, instructions: ["Face photo", "Arched back", "Mouth open", "Good lighting"], styleId: "arch-sucking" },
  { id: "55", title: "Twerking on Dick", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/feet_show.webp", isFree: false, isPopular: false, tags: ["Twerking", "Dick"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Back view photo", "Bent over", "Ass visible", "Good lighting"], styleId: "twerking-on-dick" },
  { id: "56", title: "Pleasuring Herself", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Pleasure", "Solo"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Hand near crotch", "Good lighting"], styleId: "pleasuring-herself" },
  { id: "57", title: "BBC Double Facial", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["BBC", "Facial"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 30, instructions: ["Face photo", "Eyes closed", "Mouth open", "Good lighting"], styleId: "bbc-double-facial" },
  { id: "58", title: "Close Up POV Ride", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Ride", "POV"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 30, instructions: ["Face close-up", "Looking down", "Hair visible", "Good lighting"], styleId: "close-up-pov-ride" },
  { id: "59", title: "POV Face Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Face", "Fuck"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 30, instructions: ["Face close-up", "Mouth wide open", "Tears visible", "Good lighting"], styleId: "pov-face-fuck" },
  { id: "60", title: "Pay For Boobs", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/posing_naked.webp", isFree: false, isPopular: false, tags: ["Boobs", "Pay"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 30, instructions: ["Upper body photo", "Boobs visible", "Hands near chest", "Good lighting"], styleId: "pay-for-boobs" },
  { id: "61", title: "Cum on Tits", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/posing_naked.webp", isFree: false, isPopular: false, tags: ["Cum", "Tits"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Upper body photo", "Boobs visible", "Lying back", "Good lighting"], styleId: "cum-on-tits" },
  { id: "62", title: "Freeze Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/pov_blowjob.webp", isFree: false, isPopular: false, tags: ["Freeze", "Blowjob"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Face photo", "Frozen expression", "Mouth open", "Good lighting"], styleId: "freeze-blowjob" },
  { id: "63", title: "Legs Up Sex", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/hiding_naked.webp", isFree: false, isPopular: false, tags: ["Legs", "Up"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs in air", "Good lighting"], styleId: "ulora_8" },
  { id: "64", title: "Close Up Pussy Ride", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/feet_show.webp", isFree: false, isPopular: false, tags: ["Pussy", "Ride"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Full body photo", "Sitting pose", "Legs spread", "Good lighting"], styleId: "close-up-pussy-ride" },
  { id: "65", title: "Both Hands Face Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/feet_show.webp", isFree: false, isPopular: false, tags: ["Hands", "Face"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Face close-up", "Mouth wide open", "Hands near face", "Good lighting"], styleId: "both-hands-face-fuck" },
  { id: "66", title: "Jerking Cumshot", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Jerking", "Cumshot"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 30, instructions: ["Full body photo", "Hand near crotch", "Sitting pose", "Good lighting"], styleId: "jerking-cumshot" },
  { id: "67", title: "Anime Shy Undress", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Anime", "Shy"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Full body photo", "Shy pose", "Arms covering", "Good lighting"], styleId: "ulora_11" },
  { id: "68", title: "Spoon Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["Spoon", "Fuck"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying on side", "Legs bent", "Good lighting"], styleId: "ulora_25" },
  { id: "69", title: "BBC Prone Bone", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["BBC", "Prone"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying face down", "Ass up", "Good lighting"], styleId: "ulora_35" },
  { id: "70", title: "Double Hole Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Double", "Hole"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 30, instructions: ["Full body photo", "Bent over", "Both holes visible", "Good lighting"], styleId: "ulora_50" },
  { id: "71", title: "Show Ass", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Show", "Ass"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 30, instructions: ["Back view photo", "Bent over", "Ass visible", "Good lighting"], styleId: "ulora_78" },
  { id: "72", title: "Doggy POV", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Doggy", "POV"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 30, instructions: ["Back view photo", "On all fours", "Ass up", "Good lighting"], styleId: "ulora_86" },
  { id: "73", title: "Soapy Massage", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Soapy", "Massage"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Body visible", "Good lighting"], styleId: "ulora_92" },
  { id: "74", title: "Cum Walk", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: false, tags: ["Cum", "Walk"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Full body photo", "Walking pose", "Body visible", "Good lighting"], styleId: "ulora_95" },
  { id: "75", title: "Just the Tip", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/multiple-facials.webp", isFree: false, isPopular: false, tags: ["Just", "Tip"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs spread", "Good lighting"], styleId: "ulora_124" },
  { id: "76", title: "Edging Footjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Edging", "Footjob"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Feet photo", "Legs extended", "Sitting pose", "Good lighting"], styleId: "ulora_126" },
  { id: "77", title: "Angled BBC Face Fuck POV", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["BBC", "Face"], videoUrl: "", gradient: gradients[4], duration: "15s", credits: 30, instructions: ["Face close-up", "Mouth open", "Angled view", "Good lighting"], styleId: "ulora_135" },
  { id: "78", title: "Pov Cum on Face", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/posing_naked.webp", isFree: false, isPopular: false, tags: ["Cum", "Face"], videoUrl: "", gradient: gradients[5], duration: "15s", credits: 30, instructions: ["Face photo", "Eyes closed", "Mouth open", "Good lighting"], styleId: "ulora_137" },
  { id: "79", title: "Threesome Doggy Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Threesome", "Doggy"], videoUrl: "", gradient: gradients[6], duration: "15s", credits: 30, instructions: ["Full body photo", "On all fours", "Face visible", "Good lighting"], styleId: "ulora_145" },
  { id: "80", title: "Feet up Missionary", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Feet", "Missionary"], videoUrl: "", gradient: gradients[7], duration: "15s", credits: 30, instructions: ["Full body photo", "Lying down", "Legs in air", "Good lighting"], styleId: "ulora_150" },
  { id: "81", title: "POV Handjob Facial", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/blowjob.webp", isFree: false, isPopular: false, tags: ["Handjob", "Facial"], videoUrl: "", gradient: gradients[8], duration: "15s", credits: 30, instructions: ["Face photo", "Eyes closed", "Mouth open", "Good lighting"], styleId: "ulora_161" },
  { id: "82", title: "Blowjob Footjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Blowjob", "Footjob"], videoUrl: "", gradient: gradients[9], duration: "15s", credits: 30, instructions: ["Face and feet photo", "Mouth open", "Feet visible", "Good lighting"], styleId: "ulora_166" },
  { id: "83", title: "Energetic Blowjob", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Energetic", "Blowjob"], videoUrl: "", gradient: gradients[10], duration: "15s", credits: 30, instructions: ["Face photo", "Energetic expression", "Mouth open", "Good lighting"], styleId: "ulora_169" },
  { id: "84", title: "Choke Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/undress_V2.webp", isFree: false, isPopular: false, tags: ["Choke", "Fuck"], videoUrl: "", gradient: gradients[11], duration: "15s", credits: 30, instructions: ["Face close-up", "Hands near neck", "Intense expression", "Good lighting"], styleId: "ulora_168" },
  { id: "85", title: "Carry and Fuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/cowgirl.webp", isFree: false, isPopular: false, tags: ["Carry", "Fuck"], videoUrl: "", gradient: gradients[0], duration: "15s", credits: 30, instructions: ["Full body photo", "Standing pose", "Legs wrapped", "Good lighting"], styleId: "ulora_184" },
  { id: "86", title: "Hard Restrain Doggy", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/ass_spread.webp", isFree: false, isPopular: false, tags: ["Restrain", "Doggy"], videoUrl: "", gradient: gradients[1], duration: "15s", credits: 30, instructions: ["Back view photo", "Bent over", "Arms restrained", "Good lighting"], styleId: "ulora_202" },
  { id: "87", title: "Forced Facefuck", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["Forced", "Facefuck"], videoUrl: "", gradient: gradients[2], duration: "15s", credits: 30, instructions: ["Face close-up", "Mouth wide open", "Tears visible", "Good lighting"], styleId: "ulora_203" },
  { id: "88", title: "Rough Doggy", thumbnail: "https://lf-storage-pull-zone.b-cdn.net/static/posters/facial_v2.webp", isFree: false, isPopular: false, tags: ["Rough", "Doggy"], videoUrl: "", gradient: gradients[3], duration: "15s", credits: 30, instructions: ["Back view photo", "Bent over", "Hair pulled", "Good lighting"], styleId: "ulora_220" },
];

const ITEMS_PER_PAGE = 12;

export default function DiscoverPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loginOpen, setLoginOpen] = useState(false);
  const { settings } = useSettings();

  const totalPages = Math.ceil(allTemplates.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTemplates = allTemplates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  const closeModal = () => {
    setSelectedTemplate(null);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = Math.min(maxVisible, totalPages - 1);
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - maxVisible + 1);
      }

      if (start > 2) pages.push("...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="pt-32 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Discover Styles
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-sm">
            Choose a style and upload a photo to generate your AI video
          </p>
        </div>

        {/* Template Grid - 4 per row desktop, 2 per row mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {currentTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isAutoPlay={settings.autoPlayVideos}
              onClick={() => handleTemplateClick(template)}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-12">
            {/* Previous button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                currentPage === 1
                  ? "text-text-secondary/40 cursor-not-allowed"
                  : "text-text-secondary hover:text-white hover:bg-card"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Page numbers */}
            {getPageNumbers().map((page, index) =>
              typeof page === "string" ? (
                <span key={`ellipsis-${index}`} className="px-3 py-2 text-text-secondary text-base">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-12 h-12 rounded-lg text-base font-medium transition-colors ${
                    currentPage === page
                      ? "bg-accent-orange text-white"
                      : "text-text-secondary hover:text-white hover:bg-card"
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                currentPage === totalPages
                  ? "text-text-secondary/40 cursor-not-allowed"
                  : "text-text-secondary hover:text-white hover:bg-card"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Video Create Modal */}
        {selectedTemplate && (
          <VideoCreateModal
            isOpen={!!selectedTemplate}
            onClose={closeModal}
            onOpenLogin={() => {
              closeModal();
              setLoginOpen(true);
            }}
            template={{
              id: selectedTemplate.id,
              name: selectedTemplate.title,
              duration: selectedTemplate.duration,
              credits: selectedTemplate.credits,
              videoUrl: "",
              thumbnailUrl: selectedTemplate.thumbnail,
              instructions: selectedTemplate.instructions,
              gradient: selectedTemplate.gradient,
              styleId: selectedTemplate.styleId,
            }}
          />
        )}

        {/* Login Modal */}
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
      </div>
    </div>
  );
}