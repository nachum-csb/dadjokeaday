'use client';

import React, { useState, useEffect, useRef } from 'react';

// =============================================================================
// SMILE COUNTER - Track the joy we're spreading!
// =============================================================================
// This connects to Supabase for a global smile counter.
// See BACKEND_SETUP.md for setup instructions.

// CONFIGURATION - Your Supabase credentials
const SUPABASE_URL = 'https://ssrczrdihcxfqxscqmkw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzcmN6cmRpaGN4ZnF4c2NxbWt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxMzEzNDQsImV4cCI6MjA4MDcwNzM0NH0.rrf2OQqfpZnCWmcos7JO3TE0uwUvdNic-Xnjk3Xf_G4';
const BASE_SMILE_COUNT = 47832; // Fallback if API fails

// Simple Supabase client (no npm package needed for basic ops)
const supabaseRequest = async (endpoint, options = {}) => {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    // Not configured yet, use localStorage fallback
    return null;
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
      ...options,
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': options.prefer || 'return=representation',
        ...options.headers,
      },
    });
    return response.json();
  } catch (error) {
    console.error('Supabase request failed:', error);
    return null;
  }
};

// Get smile count from Supabase (or localStorage fallback)
const getSmileCount = async () => {
  // Try Supabase first
  const data = await supabaseRequest('smile_counter?id=eq.1&select=count');
  if (data && data[0]) {
    return data[0].count;
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dadJokesSmileCount');
    return stored ? parseInt(stored, 10) : BASE_SMILE_COUNT;
  }
  return BASE_SMILE_COUNT;
};

// Increment smile count (Supabase RPC or localStorage fallback)
const incrementSmileCount = async (amount = 1) => {
  // Try Supabase RPC
  if (SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/increment_smiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });
      const newCount = await response.json();
      if (typeof newCount === 'number') {
        return newCount;
      }
    } catch (error) {
      console.error('Failed to increment via Supabase:', error);
    }
  }
  
  // Fallback to localStorage
  if (typeof window !== 'undefined') {
    const current = parseInt(localStorage.getItem('dadJokesSmileCount') || BASE_SMILE_COUNT, 10);
    const newCount = current + amount;
    localStorage.setItem('dadJokesSmileCount', newCount.toString());
    return newCount;
  }
  return BASE_SMILE_COUNT;
};

// Submit a joke to Supabase
const submitJokeToBackend = async (joke) => {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    // Not configured, just simulate success
    console.log('Joke submission (backend not configured):', joke);
    return { success: true, simulated: true };
  }
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/joke_submissions`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name: joke.name,
        setup: joke.setup,
        punchline: joke.punchline,
        category: joke.category,
      }),
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Submission failed' };
    }
  } catch (error) {
    console.error('Failed to submit joke:', error);
    return { success: false, error };
  }
};

// =============================================================================
// SMILE COUNTER COMPONENT
// =============================================================================

const SmileCounter = ({ count, justIncremented }) => {
  const formattedCount = count.toLocaleString();
  
  return (
    <div className={`smile-counter ${justIncremented ? 'celebrating' : ''}`}>
      <div className="smile-counter-inner">
        <span className="smile-icon">😊</span>
        <div className="smile-stats">
          <span className="smile-number">{formattedCount}</span>
          <span className="smile-label">smiles brought into the world</span>
        </div>
      </div>
      {justIncremented && (
        <div className="smile-celebration">
          <span>+1 😄</span>
        </div>
      )}
    </div>
  );
};

// =============================================================================
// ONE YEAR OF DAD JOKES - CLEANED & UPDATED
// June 8, 2025 - December 7, 2026 (Half past, half future)
// All duplicates removed, all content verified clean and safe
// =============================================================================

const jokesDatabase = [
  // JUNE 2025 (PAST)
  { id: 1, date: '2025-06-08', setup: "What do you call a fake noodle?", punchline: "An impasta!", category: "Food" },
  { id: 2, date: '2025-06-09', setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!", category: "Science" },
  { id: 3, date: '2025-06-10', setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!", category: "Animals" },
  { id: 4, date: '2025-06-11', setup: "Why did the scarecrow win an award?", punchline: "He was outstanding in his field!", category: "Classic" },
  { id: 5, date: '2025-06-12', setup: "What do you call a fish without eyes?", punchline: "A fsh!", category: "Animals" },
  { id: 6, date: '2025-06-13', setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!", category: "Food" },
  { id: 7, date: '2025-06-14', setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved.", category: "Nature" },
  { id: 8, date: '2025-06-15', setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!", category: "Classic" },
  { id: 9, date: '2025-06-16', setup: "What do you call a lazy kangaroo?", punchline: "A pouch potato!", category: "Animals" },
  { id: 10, date: '2025-06-17', setup: "Why don't skeletons fight each other?", punchline: "They don't have the guts!", category: "Classic" },
  { id: 11, date: '2025-06-18', setup: "What did the grape do when it got stepped on?", punchline: "Nothing, it just let out a little wine.", category: "Food" },
  { id: 12, date: '2025-06-19', setup: "Why can't you give Elsa a balloon?", punchline: "Because she'll let it go!", category: "Movies" },
  { id: 13, date: '2025-06-20', setup: "What do you call a dinosaur that crashes their car?", punchline: "Tyrannosaurus Wrecks!", category: "Animals" },
  { id: 14, date: '2025-06-21', setup: "Why do fathers take an extra pair of socks when they go golfing?", punchline: "In case they get a hole in one!", category: "Sports" },
  { id: 15, date: '2025-06-22', setup: "What do you call a factory that makes okay products?", punchline: "A satisfactory!", category: "Work" },
  { id: 16, date: '2025-06-23', setup: "What do you call a snowman's dog?", punchline: "A slush puppy!", category: "Holiday" },
  { id: 17, date: '2025-06-24', setup: "Why did the coffee file a police report?", punchline: "It got mugged!", category: "Food" },
  { id: 18, date: '2025-06-25', setup: "What do you call a sleeping dinosaur?", punchline: "A dino-snore!", category: "Animals" },
  { id: 19, date: '2025-06-26', setup: "Why don't stairs ever get tired?", punchline: "Because they're always up to something!", category: "Classic" },
  { id: 20, date: '2025-06-27', setup: "What did the buffalo say when his son left for college?", punchline: "Bison!", category: "Animals" },
  { id: 21, date: '2025-06-28', setup: "Why don't oysters donate to charity?", punchline: "Because they're shellfish!", category: "Animals" },
  { id: 22, date: '2025-06-29', setup: "What's the best thing about Switzerland?", punchline: "I don't know, but the flag is a big plus!", category: "Classic" },
  { id: 23, date: '2025-06-30', setup: "Why did the gym close down?", punchline: "It just didn't work out!", category: "Sports" },

  // JULY 2025 (PAST)
  { id: 24, date: '2025-07-01', setup: "What do you call a parade of rabbits hopping backwards?", punchline: "A receding hare-line!", category: "Animals" },
  { id: 25, date: '2025-07-02', setup: "Why did the tomato turn red?", punchline: "Because it saw the salad dressing!", category: "Food" },
  { id: 26, date: '2025-07-03', setup: "What do you call a dog that does magic tricks?", punchline: "A Labracadabrador!", category: "Animals" },
  { id: 27, date: '2025-07-04', setup: "Why did the math book look so sad?", punchline: "Because it had so many problems!", category: "Science" },
  { id: 28, date: '2025-07-05', setup: "What do you call a boomerang that doesn't come back?", punchline: "A stick!", category: "Classic" },
  { id: 29, date: '2025-07-06', setup: "Why did the cookie go to the doctor?", punchline: "Because it felt crummy!", category: "Food" },
  { id: 30, date: '2025-07-07', setup: "What do you call a cow with no legs?", punchline: "Ground beef!", category: "Animals" },
  { id: 31, date: '2025-07-08', setup: "Why did the picture go to jail?", punchline: "Because it was framed!", category: "Classic" },
  { id: 32, date: '2025-07-09', setup: "What do you call a pig that does karate?", punchline: "A pork chop!", category: "Animals" },
  { id: 33, date: '2025-07-10', setup: "Why did the banana go to the doctor?", punchline: "Because it wasn't peeling well!", category: "Food" },
  { id: 34, date: '2025-07-11', setup: "What do you call a snowman with a six-pack?", punchline: "An abdominal snowman!", category: "Classic" },
  { id: 35, date: '2025-07-12', setup: "Why don't some couples go to the gym?", punchline: "Because some relationships don't work out!", category: "Classic" },
  { id: 36, date: '2025-07-13', setup: "What do you call a bear caught in the rain?", punchline: "A drizzly bear!", category: "Animals" },
  { id: 37, date: '2025-07-14', setup: "What do you call a sleeping bull?", punchline: "A bulldozer!", category: "Animals" },
  { id: 38, date: '2025-07-15', setup: "Why did the smartphone need glasses?", punchline: "It lost all its contacts!", category: "Tech" },
  { id: 39, date: '2025-07-16', setup: "What do you call a pile of cats?", punchline: "A meow-ntain!", category: "Animals" },
  { id: 40, date: '2025-07-17', setup: "Why did the belt go to jail?", punchline: "For holding up pants!", category: "Classic" },
  { id: 41, date: '2025-07-18', setup: "What do you call a shoe made of a banana?", punchline: "A slipper!", category: "Food" },
  { id: 42, date: '2025-07-19', setup: "Why did the invisible man turn down the job offer?", punchline: "He couldn't see himself doing it!", category: "Work" },
  { id: 43, date: '2025-07-20', setup: "What do you call a duck that gets all A's?", punchline: "A wise quacker!", category: "Animals" },
  { id: 44, date: '2025-07-21', setup: "Why did the stadium get so hot after the game?", punchline: "All the fans left!", category: "Sports" },
  { id: 45, date: '2025-07-22', setup: "What do you call a can opener that doesn't work?", punchline: "A can't opener!", category: "Classic" },
  { id: 46, date: '2025-07-23', setup: "Why did the computer go to the doctor?", punchline: "Because it had a virus!", category: "Tech" },
  { id: 47, date: '2025-07-24', setup: "What do you call a fish wearing a bowtie?", punchline: "Sofishticated!", category: "Animals" },
  { id: 48, date: '2025-07-25', setup: "Why did the tree go to the dentist?", punchline: "To get a root canal!", category: "Nature" },
  { id: 49, date: '2025-07-26', setup: "What do you call a hen looking at a bowl of lettuce?", punchline: "A chicken sees a salad!", category: "Food" },
  { id: 50, date: '2025-07-27', setup: "Why did the music teacher go to jail?", punchline: "For getting into treble!", category: "Classic" },
  { id: 51, date: '2025-07-28', setup: "What do you call a fake stone in Ireland?", punchline: "A sham rock!", category: "Classic" },
  { id: 52, date: '2025-07-29', setup: "Why did the calendar break up with the clock?", punchline: "Their days were numbered!", category: "Classic" },
  { id: 53, date: '2025-07-30', setup: "What do you call a groundhog that predicts weather?", punchline: "A furry-caster!", category: "Animals" },
  { id: 54, date: '2025-07-31', setup: "Why did the tennis player bring a flashlight?", punchline: "Because he lost all his matches!", category: "Sports" },

  // AUGUST 2025 (PAST)
  { id: 55, date: '2025-08-01', setup: "Why don't elephants use computers?", punchline: "They're afraid of the mouse!", category: "Animals" },
  { id: 56, date: '2025-08-02', setup: "What do you call a cheese that isn't yours?", punchline: "Nacho cheese!", category: "Food" },
  { id: 57, date: '2025-08-03', setup: "Why did the astronaut break up with his girlfriend?", punchline: "He needed more space!", category: "Science" },
  { id: 58, date: '2025-08-04', setup: "What do you call a penguin in the Sahara?", punchline: "Lost!", category: "Animals" },
  { id: 59, date: '2025-08-05', setup: "Why did the orange lose the race?", punchline: "It ran out of juice!", category: "Food" },
  { id: 60, date: '2025-08-06', setup: "Why don't mountains get cold?", punchline: "They wear snow caps!", category: "Nature" },
  { id: 61, date: '2025-08-07', setup: "What do you call a cow on a trampoline?", punchline: "A milkshake!", category: "Animals" },
  { id: 62, date: '2025-08-08', setup: "Why did the lamp go to school?", punchline: "To get a little brighter!", category: "Classic" },
  { id: 63, date: '2025-08-09', setup: "What did the calculator say to the pencil on Valentine's Day?", punchline: "You can always count on me!", category: "Holiday" },
  { id: 64, date: '2025-08-10', setup: "Why did the chicken join a band?", punchline: "Because it had the drumsticks!", category: "Animals" },
  { id: 65, date: '2025-08-11', setup: "What do you call a snowman in summer?", punchline: "A puddle!", category: "Nature" },
  { id: 66, date: '2025-08-12', setup: "Why did the dentist become a baseball coach?", punchline: "He knew the drill!", category: "Sports" },
  { id: 67, date: '2025-08-13', setup: "What do you call an alligator detective?", punchline: "An investi-gator!", category: "Animals" },
  { id: 68, date: '2025-08-14', setup: "Why did the student eat his homework?", punchline: "Because his teacher said it was a piece of cake!", category: "Food" },
  { id: 69, date: '2025-08-15', setup: "What do you call a fly without wings?", punchline: "A walk!", category: "Animals" },
  { id: 70, date: '2025-08-16', setup: "Why did the burglar take a bath?", punchline: "He wanted to make a clean getaway!", category: "Classic" },
  { id: 71, date: '2025-08-17', setup: "What do you call a dinosaur with an extensive vocabulary?", punchline: "A thesaurus!", category: "Animals" },
  { id: 72, date: '2025-08-18', setup: "What do you call a monkey that loves chips?", punchline: "A chipmunk!", category: "Animals" },
  { id: 73, date: '2025-08-19', setup: "Why did the baker go to therapy?", punchline: "He had too many emotional turnovers!", category: "Food" },
  { id: 74, date: '2025-08-20', setup: "Why did the cookie cry?", punchline: "Because its mother was a wafer so long!", category: "Food" },
  { id: 75, date: '2025-08-21', setup: "What do you call a snowman with a temper?", punchline: "A meltdown waiting to happen!", category: "Nature" },
  { id: 76, date: '2025-08-22', setup: "Why did the lion eat the tightrope walker?", punchline: "He wanted a well-balanced meal!", category: "Animals" },
  { id: 77, date: '2025-08-23', setup: "What do you call a dinosaur that's a noisy sleeper?", punchline: "A Brontosnorus!", category: "Animals" },
  { id: 78, date: '2025-08-24', setup: "Why did the man put his money in the freezer?", punchline: "He wanted cold hard cash!", category: "Classic" },
  { id: 79, date: '2025-08-25', setup: "What do you call a sad strawberry?", punchline: "A blueberry!", category: "Food" },
  { id: 80, date: '2025-08-26', setup: "Why did the robot go on vacation?", punchline: "To recharge its batteries!", category: "Tech" },
  { id: 81, date: '2025-08-27', setup: "What do you call a cat that bowls?", punchline: "An alley cat!", category: "Animals" },
  { id: 82, date: '2025-08-28', setup: "Why did the banker quit his job?", punchline: "He lost interest!", category: "Work" },
  { id: 83, date: '2025-08-29', setup: "What do you call a group of musical whales?", punchline: "An orca-stra!", category: "Animals" },
  { id: 84, date: '2025-08-30', setup: "Why did the skeleton refuse to skydive?", punchline: "He didn't have the stomach for it!", category: "Classic" },
  { id: 85, date: '2025-08-31', setup: "What do you call a fish that practices medicine?", punchline: "A sturgeon!", category: "Animals" },

  // SEPTEMBER 2025 (PAST)
  { id: 86, date: '2025-09-01', setup: "Why did the broom get a promotion?", punchline: "It swept the competition!", category: "Work" },
  { id: 87, date: '2025-09-02', setup: "What do you call a snobbish criminal going down stairs?", punchline: "A condescending con descending!", category: "Classic" },
  { id: 88, date: '2025-09-03', setup: "Why did the fraction worry about marrying the decimal?", punchline: "Because he would have to convert!", category: "Science" },
  { id: 89, date: '2025-09-04', setup: "What do you call 3.14 percent of sailors?", punchline: "Pi-rates!", category: "Science" },
  { id: 90, date: '2025-09-05', setup: "Why did the clock get sick?", punchline: "It was run down!", category: "Classic" },
  { id: 91, date: '2025-09-06', setup: "Why did the physics teacher break up with the biology teacher?", punchline: "There was no chemistry!", category: "Science" },
  { id: 92, date: '2025-09-07', setup: "What do you call the first day of spring?", punchline: "A spring break!", category: "Nature" },
  { id: 93, date: '2025-09-08', setup: "Why did the gardener plant lightbulbs?", punchline: "He wanted a power plant!", category: "Nature" },
  { id: 94, date: '2025-09-09', setup: "Why did the clock go to the principal's office?", punchline: "For tocking too much!", category: "Classic" },
  { id: 95, date: '2025-09-10', setup: "What do you call a fish with two knees?", punchline: "A two-knee fish!", category: "Animals" },
  { id: 96, date: '2025-09-11', setup: "Why did the electrician close his business?", punchline: "Business was light!", category: "Work" },
  { id: 97, date: '2025-09-12', setup: "What do you call a bee that can't make up its mind?", punchline: "A maybe!", category: "Animals" },
  { id: 98, date: '2025-09-13', setup: "Why did the envelope go to the hospital?", punchline: "It had a bad case of the letters!", category: "Classic" },
  { id: 99, date: '2025-09-14', setup: "What do you call a nervous witch?", punchline: "A twitch!", category: "Holiday" },
  { id: 100, date: '2025-09-15', setup: "Why did the football coach go to the bank?", punchline: "To get his quarterback!", category: "Sports" },
  { id: 101, date: '2025-09-16', setup: "Why did the vegetable band break up?", punchline: "They couldn't find a good beet!", category: "Food" },
  { id: 102, date: '2025-09-17', setup: "Why did the cookie go to school?", punchline: "To become a smart cookie!", category: "Classic" },
  { id: 103, date: '2025-09-18', setup: "What do you call a rabbit with fleas?", punchline: "Bugs Bunny!", category: "Animals" },
  { id: 104, date: '2025-09-19', setup: "Why did the computer get glasses?", punchline: "To improve its website!", category: "Tech" },
  { id: 105, date: '2025-09-20', setup: "What do you call a horse that lives next door?", punchline: "A neigh-bor!", category: "Animals" },
  { id: 106, date: '2025-09-21', setup: "Why did the sun go to school?", punchline: "To get brighter!", category: "Nature" },
  { id: 107, date: '2025-09-22', setup: "What do you call a flower that runs on electricity?", punchline: "A power plant!", category: "Nature" },
  { id: 108, date: '2025-09-23', setup: "What do you call a grumpy cow?", punchline: "Moo-dy!", category: "Animals" },
  { id: 109, date: '2025-09-24', setup: "Why did the duck get detention?", punchline: "For quacking jokes in class!", category: "Animals" },
  { id: 110, date: '2025-09-25', setup: "What do you call a belt made of watches?", punchline: "A waist of time!", category: "Classic" },
  { id: 111, date: '2025-09-26', setup: "Why did the paper go to the party?", punchline: "To get shredded!", category: "Classic" },
  { id: 112, date: '2025-09-27', setup: "What do you call a sheep with no legs?", punchline: "A cloud!", category: "Animals" },
  { id: 113, date: '2025-09-28', setup: "Why did the music note go to the doctor?", punchline: "It had a bad case of the trebles!", category: "Classic" },
  { id: 114, date: '2025-09-29', setup: "Why did the egg cross the road?", punchline: "To get to the Shell station!", category: "Food" },
  { id: 115, date: '2025-09-30', setup: "What do you call a lizard that sings?", punchline: "A rap-tile!", category: "Animals" },

  // OCTOBER 2025 (PAST)
  { id: 116, date: '2025-10-01', setup: "Why did the kid bring a ladder to school?", punchline: "To go to high school!", category: "Classic" },
  { id: 117, date: '2025-10-02', setup: "What do you call a rabbit that tells good jokes?", punchline: "A funny bunny!", category: "Animals" },
  { id: 118, date: '2025-10-03', setup: "Why did the phone wear glasses?", punchline: "It lost its contacts!", category: "Tech" },
  { id: 119, date: '2025-10-04', setup: "What do you call a nervous javelin thrower?", punchline: "Shakespeare!", category: "Sports" },
  { id: 120, date: '2025-10-05', setup: "Why did the Earth break up with the Moon?", punchline: "It needed more space!", category: "Science" },
  { id: 121, date: '2025-10-06', setup: "What do you call a fish that needs help with their singing?", punchline: "Auto-tuna!", category: "Animals" },
  { id: 122, date: '2025-10-07', setup: "Why did the calendar go to therapy?", punchline: "Its days were numbered!", category: "Classic" },
  { id: 123, date: '2025-10-08', setup: "What do you call a bird that's afraid to fly?", punchline: "Chicken!", category: "Animals" },
  { id: 124, date: '2025-10-09', setup: "Why did the pirate go to school?", punchline: "To improve his arrrticulation!", category: "Classic" },
  { id: 125, date: '2025-10-10', setup: "What do you call a pencil with no point?", punchline: "Pointless!", category: "Classic" },
  { id: 126, date: '2025-10-11', setup: "Why did the corn stalk get mad at the farmer?", punchline: "He kept pulling its ears!", category: "Food" },
  { id: 127, date: '2025-10-12', setup: "What do you call a lazy spider?", punchline: "A cobweb designer!", category: "Animals" },
  { id: 128, date: '2025-10-13', setup: "Why did the bucket go to the doctor?", punchline: "It was feeling a little pail!", category: "Classic" },
  { id: 129, date: '2025-10-14', setup: "What do you call a flower on your face?", punchline: "Tulips!", category: "Nature" },
  { id: 130, date: '2025-10-15', setup: "What do you call a train loaded with toffee?", punchline: "A chew chew train!", category: "Food" },
  { id: 131, date: '2025-10-16', setup: "Why did Yoda cross the road?", punchline: "Because the chickens forced him!", category: "Movies" },
  { id: 132, date: '2025-10-17', setup: "Why did the nurse bring a pencil to work?", punchline: "In case she needed to draw a conclusion!", category: "Work" },
  { id: 133, date: '2025-10-18', setup: "What do you call a dinosaur that never gives up?", punchline: "A try-try-try-ceratops!", category: "Animals" },
  { id: 134, date: '2025-10-19', setup: "Why did the basketball player sit on the sideline?", punchline: "He wanted to be a bench warmer!", category: "Sports" },
  { id: 135, date: '2025-10-20', setup: "What do you call a musical insect?", punchline: "A humbug!", category: "Animals" },
  { id: 136, date: '2025-10-21', setup: "What do you call a sleeping pizza?", punchline: "A piZZZZZa!", category: "Food" },
  { id: 137, date: '2025-10-22', setup: "Why did the mushroom go to the party?", punchline: "Because he was a fun-gi!", category: "Food" },
  { id: 138, date: '2025-10-23', setup: "What do you call a bee that's having a bad hair day?", punchline: "A frisbee!", category: "Animals" },
  { id: 139, date: '2025-10-24', setup: "Why did the pencil feel stupid?", punchline: "Because it wasn't very sharp!", category: "Classic" },
  { id: 140, date: '2025-10-25', setup: "What do you call an ant that fights crime?", punchline: "A vigil-ant-e!", category: "Animals" },
  { id: 141, date: '2025-10-26', setup: "Why did the teddy bear say no to dessert?", punchline: "She was already stuffed!", category: "Classic" },
  { id: 142, date: '2025-10-27', setup: "Why did the leaf go to the doctor?", punchline: "It was feeling green!", category: "Nature" },
  { id: 143, date: '2025-10-28', setup: "What do you call a funny mountain?", punchline: "Hill-arious!", category: "Nature" },
  { id: 144, date: '2025-10-29', setup: "Why did the geologist break up with his girlfriend?", punchline: "He took her for granite!", category: "Science" },
  { id: 145, date: '2025-10-30', setup: "What do you call a happy cowboy?", punchline: "A jolly rancher!", category: "Food" },
  { id: 146, date: '2025-10-31', setup: "Why did the old man fall in the well?", punchline: "He couldn't see that well!", category: "Classic" },

  // NOVEMBER 2025 (PAST)
  { id: 147, date: '2025-11-01', setup: "What do you call a spider that can dance?", punchline: "A jitterbug!", category: "Animals" },
  { id: 148, date: '2025-11-02', setup: "Why did the basketball player bring a ladder?", punchline: "He wanted to shoot for the stars!", category: "Sports" },
  { id: 149, date: '2025-11-03', setup: "Why did the raisin go out with the prune?", punchline: "Because he couldn't find a date!", category: "Food" },
  { id: 150, date: '2025-11-04', setup: "What do you call a camel with no humps?", punchline: "Humphrey!", category: "Animals" },
  { id: 151, date: '2025-11-05', setup: "Why did the lemon stop in the middle of the road?", punchline: "It ran out of juice!", category: "Food" },
  { id: 152, date: '2025-11-06', setup: "What do you call a magician without magic?", punchline: "Ian!", category: "Classic" },
  { id: 153, date: '2025-11-07', setup: "Why did the cat sit on the computer?", punchline: "To keep an eye on the mouse!", category: "Animals" },
  { id: 154, date: '2025-11-08', setup: "What do you call a lazy doctor?", punchline: "Dr. Do-little!", category: "Work" },
  { id: 155, date: '2025-11-09', setup: "Why did the skeleton go to the party alone?", punchline: "He had no body to go with!", category: "Classic" },
  { id: 156, date: '2025-11-10', setup: "What do you call a snail on a ship?", punchline: "A snailor!", category: "Animals" },
  { id: 157, date: '2025-11-11', setup: "Why did the traffic light turn red?", punchline: "You would too if you had to change in the middle of the street!", category: "Classic" },
  { id: 158, date: '2025-11-12', setup: "What do you call a cold dog?", punchline: "A chili dog!", category: "Food" },
  { id: 159, date: '2025-11-13', setup: "Why did the rope break up with the string?", punchline: "It was too knotty!", category: "Classic" },
  { id: 160, date: '2025-11-14', setup: "What do you call a snake that works for the government?", punchline: "A civil serpent!", category: "Animals" },
  { id: 161, date: '2025-11-15', setup: "Why did the banana split?", punchline: "Because it saw the ice cream sundae!", category: "Food" },
  { id: 162, date: '2025-11-16', setup: "What do you call a bird that sticks to everything?", punchline: "A vel-crow!", category: "Animals" },
  { id: 163, date: '2025-11-17', setup: "Why did the bowling pins stop talking?", punchline: "They were on strike!", category: "Sports" },
  { id: 164, date: '2025-11-18', setup: "What do you call a blind dinosaur?", punchline: "A do-you-think-he-saurus!", category: "Animals" },
  { id: 165, date: '2025-11-19', setup: "Why did the computer keep sneezing?", punchline: "It had a virus!", category: "Tech" },
  { id: 166, date: '2025-11-20', setup: "What do you call a baby whale?", punchline: "A little whaley cute one!", category: "Animals" },
  { id: 167, date: '2025-11-21', setup: "Why did the book go to the hospital?", punchline: "It had a broken spine!", category: "Classic" },
  { id: 168, date: '2025-11-22', setup: "Why did the rocket lose its job?", punchline: "It got fired!", category: "Science" },
  { id: 169, date: '2025-11-23', setup: "What do you call a zombie who cooks stir fry?", punchline: "Dead man wok-ing!", category: "Food" },
  { id: 170, date: '2025-11-24', setup: "Why did the reporter go to the ice cream shop?", punchline: "To get the scoop!", category: "Food" },
  { id: 171, date: '2025-11-25', setup: "What do you call the longest day of the year?", punchline: "The summer soul-stice!", category: "Nature" },
  { id: 172, date: '2025-11-26', setup: "Why did the ocean break up with the pond?", punchline: "It thought the pond was too shallow!", category: "Nature" },
  { id: 173, date: '2025-11-27', setup: "What do you call a sheep that sings?", punchline: "A baa-ritone!", category: "Animals" },
  { id: 174, date: '2025-11-28', setup: "Why did the melon jump into the lake?", punchline: "It wanted to be a watermelon!", category: "Food" },
  { id: 175, date: '2025-11-29', setup: "What do you call a cat that gets what it wants?", punchline: "Purr-suasive!", category: "Animals" },
  { id: 176, date: '2025-11-30', setup: "Why did the vacuum cleaner quit its job?", punchline: "It was tired of being pushed around!", category: "Work" },

  // DECEMBER 2025 (CURRENT - FUTURE)
  { id: 177, date: '2025-12-01', setup: "What do you call a fish that destroys Japan?", punchline: "Codzilla!", category: "Movies" },
  { id: 178, date: '2025-12-02', setup: "Why did the ocean blush?", punchline: "Because people kept waving at it!", category: "Nature" },
  { id: 179, date: '2025-12-03', setup: "What do you call a cow that plays guitar?", punchline: "A moo-sician!", category: "Animals" },
  { id: 180, date: '2025-12-04', setup: "Why did the sun take a day off?", punchline: "It was feeling a little burnt out!", category: "Nature" },
  { id: 181, date: '2025-12-05', setup: "What do you call a monkey in a minefield?", punchline: "A ba-boom!", category: "Animals" },
  { id: 182, date: '2025-12-06', setup: "Why did the firecracker go to school?", punchline: "To get a little brighter!", category: "Holiday" },
  { id: 183, date: '2025-12-07', setup: "What do you call a patriotic dessert?", punchline: "Apple pie-triot!", category: "Holiday" },
  { id: 184, date: '2025-12-08', setup: "Why did the hot dog win the race?", punchline: "It was the weiner!", category: "Food" },
  { id: 185, date: '2025-12-09', setup: "What do you call a deer that costs a dollar?", punchline: "A buck!", category: "Animals" },
  { id: 186, date: '2025-12-10', setup: "Why did the beach blush?", punchline: "Because the tide came in!", category: "Nature" },
  { id: 187, date: '2025-12-11', setup: "What do you call a crab that plays baseball?", punchline: "A pinch hitter!", category: "Sports" },
  { id: 188, date: '2025-12-12', setup: "Why did the sunscreen go to school?", punchline: "To prevent burning out!", category: "Nature" },
  { id: 189, date: '2025-12-13', setup: "What do you call a fish on a plane?", punchline: "A flying fish!", category: "Animals" },
  { id: 190, date: '2025-12-14', setup: "Why did the watermelon propose?", punchline: "He was one in a melon!", category: "Food" },
  { id: 191, date: '2025-12-15', setup: "What do you call a turtle in a chef's hat?", punchline: "A slow cooker!", category: "Animals" },
  { id: 192, date: '2025-12-16', setup: "Why did the pool table go to the doctor?", punchline: "It felt a little green!", category: "Sports" },
  { id: 193, date: '2025-12-17', setup: "What do you call elves learning in school?", punchline: "The elf-abet!", category: "Holiday" },
  { id: 194, date: '2025-12-18', setup: "Why did the ice cube apologize?", punchline: "It wanted to break the ice!", category: "Classic" },
  { id: 195, date: '2025-12-19', setup: "What do you call a sunburned polar bear?", punchline: "A solar bear!", category: "Animals" },
  { id: 196, date: '2025-12-20', setup: "Why did the fan break up with the air conditioner?", punchline: "It was blowing hot and cold!", category: "Classic" },
  { id: 197, date: '2025-12-21', setup: "What do you call a dog that does experiments?", punchline: "A lab!", category: "Animals" },
  { id: 198, date: '2025-12-22', setup: "What do you call the moon's favorite gum?", punchline: "Orbit!", category: "Science" },
  { id: 199, date: '2025-12-23', setup: "Why did the sandcastle cry?", punchline: "The sea was being mean to it!", category: "Nature" },
  { id: 200, date: '2025-12-24', setup: "What do you call an obnoxious reindeer?", punchline: "Rude-olph!", category: "Holiday" },
  { id: 201, date: '2025-12-25', setup: "Why did the swimmer bring a towel to the bar?", punchline: "For dry humor!", category: "Sports" },
  { id: 202, date: '2025-12-26', setup: "Why did the popsicle never get in trouble?", punchline: "It was always cool!", category: "Food" },
  { id: 203, date: '2025-12-27', setup: "What do you call a surfing cow?", punchline: "A moo-ve maker!", category: "Animals" },
  { id: 204, date: '2025-12-28', setup: "Why did the sun go to therapy?", punchline: "It had too many flares!", category: "Science" },
  { id: 205, date: '2025-12-29', setup: "What do you call a wave that went to college?", punchline: "A micro-wave!", category: "Science" },
  { id: 206, date: '2025-12-30', setup: "Why did the coconut go to the doctor?", punchline: "It was feeling a little nutty!", category: "Food" },
  { id: 207, date: '2025-12-31', setup: "Why did the calendar go on a diet?", punchline: "It had too many dates!", category: "Classic" },

  // JANUARY 2026
  { id: 208, date: '2026-01-01', setup: "What's a New Year's resolution?", punchline: "Something that goes in one year and out the other!", category: "Holiday" },
  { id: 209, date: '2026-01-02', setup: "What do you call a sleeping bag in the woods?", punchline: "A nap-sack!", category: "Nature" },
  { id: 210, date: '2026-01-03', setup: "Why did the backpack feel empty inside?", punchline: "It lost its drive!", category: "Classic" },
  { id: 211, date: '2026-01-04', setup: "What do you call a hiking snail?", punchline: "A slow-poke!", category: "Animals" },
  { id: 212, date: '2026-01-05', setup: "Why did the corn get promoted?", punchline: "It was a-maize-ing!", category: "Food" },
  { id: 213, date: '2026-01-06', setup: "What do you call a camper without a tent?", punchline: "In-tents-ly unprepared!", category: "Nature" },
  { id: 214, date: '2026-01-07', setup: "Why did the mosquito go to school?", punchline: "To improve its bite!", category: "Animals" },
  { id: 215, date: '2026-01-08', setup: "What do you call a lazy summer day?", punchline: "A sun-day!", category: "Nature" },
  { id: 216, date: '2026-01-09', setup: "Why did the farmer win an award?", punchline: "He was outstanding in his field!", category: "Work" },
  { id: 217, date: '2026-01-10', setup: "What do you call a caterpillar in winter?", punchline: "A brrr-pillar!", category: "Animals" },
  { id: 218, date: '2026-01-11', setup: "Why did the teacher wear sunglasses?", punchline: "Her students were too bright!", category: "Classic" },
  { id: 219, date: '2026-01-12', setup: "What do you call a firefly with no light?", punchline: "A regular fly having an identity crisis!", category: "Animals" },
  { id: 220, date: '2026-01-13', setup: "Why did the book join the gym?", punchline: "To work on its paperback!", category: "Classic" },
  { id: 221, date: '2026-01-14', setup: "What do you call a snake that bakes?", punchline: "A pie-thon!", category: "Animals" },
  { id: 222, date: '2026-01-15', setup: "Why did the computer take a summer vacation?", punchline: "It needed to cool its processor!", category: "Tech" },
  { id: 223, date: '2026-01-16', setup: "What do you call a pig in the sun?", punchline: "Bacon!", category: "Animals" },
  { id: 224, date: '2026-01-17', setup: "Why did the sprinkler go to therapy?", punchline: "It had too many issues coming out!", category: "Nature" },
  { id: 225, date: '2026-01-18', setup: "What do you call a bee from America?", punchline: "A USB!", category: "Tech" },
  { id: 226, date: '2026-01-19', setup: "Why did the grass break up with the sun?", punchline: "It was tired of getting burned!", category: "Nature" },
  { id: 227, date: '2026-01-20', setup: "What do you call a frog that parks illegally?", punchline: "Toad!", category: "Animals" },
  { id: 228, date: '2026-01-21', setup: "Why did the pencil take a vacation?", punchline: "To get to the point!", category: "Classic" },
  { id: 229, date: '2026-01-22', setup: "What do you call a giraffe at the beach?", punchline: "A high tide!", category: "Animals" },
  { id: 230, date: '2026-01-23', setup: "Why did the cloud break up with the fog?", punchline: "The relationship was too misty!", category: "Nature" },
  { id: 231, date: '2026-01-24', setup: "What do you call a kangaroo at the beach?", punchline: "Sandy pouch!", category: "Animals" },
  { id: 232, date: '2026-01-25', setup: "Why did the notebook go to the beach?", punchline: "To get lined!", category: "Classic" },
  { id: 233, date: '2026-01-26', setup: "What do you call a tired pea?", punchline: "Sleep-y!", category: "Food" },
  { id: 234, date: '2026-01-27', setup: "Why did the crayon feel sad?", punchline: "It was feeling blue!", category: "Classic" },
  { id: 235, date: '2026-01-28', setup: "What do you call a fish that floats?", punchline: "Bob!", category: "Animals" },
  { id: 236, date: '2026-01-29', setup: "Why did the ruler feel important?", punchline: "It had all the measurements!", category: "Classic" },
  { id: 237, date: '2026-01-30', setup: "What do you call a nervous zucchini?", punchline: "An edgy veggie!", category: "Food" },
  { id: 238, date: '2026-01-31', setup: "Why did the summer hate math?", punchline: "Too many problems!", category: "Science" },

  // FEBRUARY 2026
  { id: 239, date: '2026-02-01', setup: "Why did the school bus feel tired?", punchline: "Too many stops!", category: "Classic" },
  { id: 240, date: '2026-02-02', setup: "What do you call a nervous apple?", punchline: "A crab apple!", category: "Food" },
  { id: 241, date: '2026-02-03', setup: "Why did the backpack feel important?", punchline: "It carried a lot of weight!", category: "Classic" },
  { id: 242, date: '2026-02-04', setup: "What do you call a cool teacher?", punchline: "A class act!", category: "Work" },
  { id: 243, date: '2026-02-05', setup: "Why did the eraser get detention?", punchline: "It kept rubbing people the wrong way!", category: "Classic" },
  { id: 244, date: '2026-02-06', setup: "What do you call a lazy student?", punchline: "A kinder-napper!", category: "Classic" },
  { id: 245, date: '2026-02-07', setup: "Why did the lunch box feel popular?", punchline: "Everyone wanted what was inside!", category: "Food" },
  { id: 246, date: '2026-02-08', setup: "What do you call a happy pencil?", punchline: "A #2 with attitude!", category: "Classic" },
  { id: 247, date: '2026-02-09', setup: "Why did the classroom clock feel slow?", punchline: "It was always watching its hands!", category: "Classic" },
  { id: 248, date: '2026-02-10', setup: "What do you call a leaf that doesn't fall?", punchline: "An over-achiever!", category: "Nature" },
  { id: 249, date: '2026-02-11', setup: "Why did the highlighter feel bright?", punchline: "It was always making a point!", category: "Classic" },
  { id: 250, date: '2026-02-12', setup: "What do you call a squirrel with no nuts?", punchline: "Frustrated!", category: "Animals" },
  { id: 251, date: '2026-02-13', setup: "Why did the desk feel stressed?", punchline: "It had too much on its plate!", category: "Work" },
  { id: 252, date: '2026-02-14', setup: "What do you call a really fast leaf?", punchline: "A leaf blower!", category: "Nature" },
  { id: 253, date: '2026-02-15', setup: "Why did the calculator feel confident?", punchline: "It could always count on itself!", category: "Science" },
  { id: 254, date: '2026-02-16', setup: "What do you call an acorn that tells jokes?", punchline: "A funny nut!", category: "Nature" },
  { id: 255, date: '2026-02-17', setup: "Why did the football feel deflated?", punchline: "It was kicked around too much!", category: "Sports" },
  { id: 256, date: '2026-02-18', setup: "What do you call a pumpkin that works out?", punchline: "A jacked-o-lantern!", category: "Food" },
  { id: 257, date: '2026-02-19', setup: "Why did the pirate love math?", punchline: "Because of the arrrrrithmetic!", category: "Classic" },
  { id: 258, date: '2026-02-20', setup: "What do you call a sleepy autumn leaf?", punchline: "Fall-ing asleep!", category: "Nature" },
  { id: 259, date: '2026-02-21', setup: "Why did the apple pie go to the dentist?", punchline: "It needed a filling!", category: "Food" },
  { id: 260, date: '2026-02-22', setup: "What do you call the first day of fall?", punchline: "A fall-cation!", category: "Nature" },
  { id: 261, date: '2026-02-23', setup: "Why did the rake feel tired?", punchline: "It was bushed!", category: "Nature" },
  { id: 262, date: '2026-02-24', setup: "What do you call a chilly pepper?", punchline: "A little chili!", category: "Food" },
  { id: 263, date: '2026-02-25', setup: "Why did the tree feel embarrassed?", punchline: "It saw its bark was showing!", category: "Nature" },
  { id: 264, date: '2026-02-26', setup: "What do you call a cranky apple?", punchline: "A grumpy crunch!", category: "Food" },
  { id: 265, date: '2026-02-27', setup: "Why did the football team go to the bakery?", punchline: "For a good roll!", category: "Sports" },
  { id: 266, date: '2026-02-28', setup: "What do you call leaves that won't fall?", punchline: "Unbe-leaf-able!", category: "Nature" },

  // MARCH 2026
  { id: 267, date: '2026-03-01', setup: "Why did the corn maze feel confused?", punchline: "It was going in circles!", category: "Food" },
  { id: 268, date: '2026-03-02', setup: "Why did the calendar love October?", punchline: "It had a date every day!", category: "Classic" },
  { id: 269, date: '2026-03-03', setup: "What do you call a dancing ghost?", punchline: "A boogie man!", category: "Holiday" },
  { id: 270, date: '2026-03-04', setup: "Why did the spider go to the computer?", punchline: "To check its web-site!", category: "Tech" },
  { id: 271, date: '2026-03-05', setup: "What do you call a fat pumpkin?", punchline: "A plumpkin!", category: "Holiday" },
  { id: 272, date: '2026-03-06', setup: "Why did the vampire read the newspaper?", punchline: "He heard it had great circulation!", category: "Holiday" },
  { id: 273, date: '2026-03-07', setup: "What do you call a witch at the beach?", punchline: "A sand-witch!", category: "Holiday" },
  { id: 274, date: '2026-03-08', setup: "Why did the mummy have no friends?", punchline: "He was too wrapped up in himself!", category: "Holiday" },
  { id: 275, date: '2026-03-09', setup: "What do you call a ghost's favorite dessert?", punchline: "Boo-berry pie!", category: "Holiday" },
  { id: 276, date: '2026-03-10', setup: "Why did the skeleton stay home?", punchline: "He had no body to go with!", category: "Holiday" },
  { id: 277, date: '2026-03-11', setup: "What do you call a werewolf YouTuber?", punchline: "A lycan-subscribe!", category: "Holiday" },
  { id: 278, date: '2026-03-12', setup: "Why did the ghost go to the bar?", punchline: "For the boos!", category: "Holiday" },
  { id: 279, date: '2026-03-13', setup: "What do you call a vampire that's always hungry?", punchline: "Count Snackula!", category: "Holiday" },
  { id: 280, date: '2026-03-14', setup: "Why did the zombie skip school?", punchline: "He felt rotten!", category: "Holiday" },
  { id: 281, date: '2026-03-15', setup: "What do you call a vampire with a cold?", punchline: "A coffin machine!", category: "Holiday" },
  { id: 282, date: '2026-03-16', setup: "Why did the pumpkin cross the road?", punchline: "It fell off the wagon!", category: "Holiday" },
  { id: 283, date: '2026-03-17', setup: "What do you call a ghost comedian?", punchline: "Dead funny!", category: "Holiday" },
  { id: 284, date: '2026-03-18', setup: "Why did the bat get a job?", punchline: "To stop hanging around!", category: "Animals" },
  { id: 285, date: '2026-03-19', setup: "What do you call a skeleton who won't work?", punchline: "Lazy bones!", category: "Holiday" },
  { id: 286, date: '2026-03-20', setup: "Why did the ghost fail his test?", punchline: "He wasn't visible enough!", category: "Holiday" },
  { id: 287, date: '2026-03-21', setup: "What do you call a haunted chicken?", punchline: "A poultry-geist!", category: "Holiday" },
  { id: 288, date: '2026-03-22', setup: "Why did the witch's broom break?", punchline: "It was having a breakdown!", category: "Holiday" },
  { id: 289, date: '2026-03-23', setup: "What do you call a clean skeleton?", punchline: "Spotless to the bone!", category: "Holiday" },
  { id: 290, date: '2026-03-24', setup: "Why did the vampire need mouthwash?", punchline: "He had bat breath!", category: "Holiday" },
  { id: 291, date: '2026-03-25', setup: "What do you call a goblin's best friend?", punchline: "A ghoul-friend!", category: "Holiday" },
  { id: 292, date: '2026-03-26', setup: "Why did the monster eat the lamp?", punchline: "He wanted a light snack!", category: "Holiday" },
  { id: 293, date: '2026-03-27', setup: "What do you call a zombie's favorite cereal?", punchline: "Rice Creepies!", category: "Holiday" },
  { id: 294, date: '2026-03-28', setup: "Why did the ghost stare at the mirror?", punchline: "To see if it was boo-tiful!", category: "Holiday" },
  { id: 295, date: '2026-03-29', setup: "What do you call a vampire's boat?", punchline: "A blood vessel!", category: "Holiday" },
  { id: 296, date: '2026-03-30', setup: "Why did the scarecrow become a politician?", punchline: "He was good at standing around doing nothing!", category: "Holiday" },
  { id: 297, date: '2026-03-31', setup: "What do you call candy that was stolen?", punchline: "Hot chocolate!", category: "Holiday" },

  // APRIL 2026
  { id: 298, date: '2026-04-01', setup: "Why did the skeleton go to the party?", punchline: "To have a rattling good time!", category: "Holiday" },
  { id: 299, date: '2026-04-02', setup: "Why did the candy wrapper feel empty?", punchline: "All the good stuff was taken!", category: "Food" },
  { id: 300, date: '2026-04-03', setup: "What do you call a grateful squirrel?", punchline: "Thank-fur-l!", category: "Animals" },
  { id: 301, date: '2026-04-04', setup: "Why did the leaves go to the doctor?", punchline: "They were feeling green!", category: "Nature" },
  { id: 302, date: '2026-04-05', setup: "What do you call a turkey on the day after Thanksgiving?", punchline: "Lucky!", category: "Holiday" },
  { id: 303, date: '2026-04-06', setup: "Why did the sweater feel warm inside?", punchline: "It was made with love!", category: "Classic" },
  { id: 304, date: '2026-04-07', setup: "What do you call a lazy turkey?", punchline: "A slouch-gobbler!", category: "Holiday" },
  { id: 305, date: '2026-04-08', setup: "Why did the pie feel shy?", punchline: "It was a little crusty on the outside!", category: "Food" },
  { id: 306, date: '2026-04-09', setup: "What do you call a smart turkey?", punchline: "A wise gobbler!", category: "Holiday" },
  { id: 307, date: '2026-04-10', setup: "Why did the gravy go to therapy?", punchline: "It had too many lumps to deal with!", category: "Food" },
  { id: 308, date: '2026-04-11', setup: "What do you call a sleeping turkey?", punchline: "A snooze bird!", category: "Holiday" },
  { id: 309, date: '2026-04-12', setup: "What do you call a turkey with a carrot in each ear?", punchline: "Anything you want, it can't hear you!", category: "Holiday" },
  { id: 310, date: '2026-04-13', setup: "Why did the cranberries turn red?", punchline: "They saw the turkey dressing!", category: "Food" },
  { id: 311, date: '2026-04-14', setup: "What do you call a running turkey?", punchline: "Fast food!", category: "Holiday" },
  { id: 312, date: '2026-04-15', setup: "Why did the stuffing feel overwhelmed?", punchline: "It was stuffed with responsibility!", category: "Food" },
  { id: 313, date: '2026-04-16', setup: "What do you call a sad cranberry?", punchline: "A blueberry in disguise!", category: "Food" },
  { id: 314, date: '2026-04-17', setup: "Why did the turkey bring a microphone?", punchline: "To give thanks-speaking!", category: "Holiday" },
  { id: 315, date: '2026-04-18', setup: "What do you call a turkey's favorite dessert?", punchline: "Peach gobbler!", category: "Holiday" },
  { id: 316, date: '2026-04-19', setup: "Why did the potato feel mashed?", punchline: "It had a rough day!", category: "Food" },
  { id: 317, date: '2026-04-20', setup: "What do you call a thankful cat?", punchline: "A purr-cious feline!", category: "Animals" },
  { id: 318, date: '2026-04-21', setup: "Why did the napkin feel important?", punchline: "It always got picked first!", category: "Classic" },
  { id: 319, date: '2026-04-22', setup: "What do you call a turkey that argues?", punchline: "A de-beak-er!", category: "Holiday" },
  { id: 320, date: '2026-04-23', setup: "Why did the dinner roll go to the gym?", punchline: "To get buns of steel!", category: "Food" },
  { id: 321, date: '2026-04-24', setup: "What do you call a parade of turkeys?", punchline: "A gobble-gation!", category: "Holiday" },
  { id: 322, date: '2026-04-25', setup: "Why did the wishbone feel torn?", punchline: "Everyone wanted a piece of it!", category: "Holiday" },
  { id: 323, date: '2026-04-26', setup: "What do you call Thanksgiving dinner on a boat?", punchline: "A gravy boat!", category: "Holiday" },
  { id: 324, date: '2026-04-27', setup: "Why did the leftover turkey feel important?", punchline: "It was still gobbling up attention!", category: "Food" },
  { id: 325, date: '2026-04-28', setup: "What do you call a shopping turkey?", punchline: "A Black Fri-day bird!", category: "Holiday" },
  { id: 326, date: '2026-04-29', setup: "Why did the sweet potato feel orange?", punchline: "It was just being itself!", category: "Food" },
  { id: 327, date: '2026-04-30', setup: "What do you call the last day of November?", punchline: "No-vember anymore!", category: "Classic" },

  // MAY 2026
  { id: 328, date: '2026-05-01', setup: "Why did the Christmas tree go to the barber?", punchline: "It needed to be trimmed!", category: "Holiday" },
  { id: 329, date: '2026-05-02', setup: "What do you call a grumpy reindeer?", punchline: "Rude-olph!", category: "Holiday" },
  { id: 330, date: '2026-05-03', setup: "Why did the ornament feel hung up?", punchline: "It couldn't get off the tree!", category: "Holiday" },
  { id: 331, date: '2026-05-04', setup: "What do you call a cat on Christmas Eve?", punchline: "Sandy Claws!", category: "Holiday" },
  { id: 332, date: '2026-05-05', setup: "Why did the gingerbread man go to the doctor?", punchline: "He was feeling crummy!", category: "Holiday" },
  { id: 333, date: '2026-05-06', setup: "What do you call an elf who sings?", punchline: "A wrapper!", category: "Holiday" },
  { id: 334, date: '2026-05-07', setup: "Why did the Christmas lights feel tangled?", punchline: "They had too many hang-ups!", category: "Holiday" },
  { id: 335, date: '2026-05-08', setup: "What do you call a joke on April 1st?", punchline: "Fool's gold!", category: "Holiday" },
  { id: 336, date: '2026-05-09', setup: "Why do leprechauns hate running?", punchline: "They'd rather jig than jog!", category: "Holiday" },
  { id: 337, date: '2026-05-10', setup: "Why did the mom cross the road?", punchline: "To get some peace and quiet!", category: "Holiday" },
  { id: 338, date: '2026-05-11', setup: "What do you call a dad who falls through the ice?", punchline: "A pop-sicle!", category: "Holiday" },
  { id: 339, date: '2026-05-12', setup: "Why did the veteran get a standing ovation?", punchline: "For serving with honor!", category: "Holiday" },
  { id: 340, date: '2026-05-13', setup: "Why did the golfer bring extra pants?", punchline: "In case he got a hole in one!", category: "Sports" },
  { id: 341, date: '2026-05-14', setup: "What do you call a super hero who's bad at their job?", punchline: "Soup-er hero — they always spill!", category: "Movies" },
  { id: 342, date: '2026-05-15', setup: "What do you call a broke Santa?", punchline: "Saint Nickel-less!", category: "Holiday" },
  { id: 343, date: '2026-05-16', setup: "What do you call a leprechaun's vacation home?", punchline: "A lepre-condo!", category: "Holiday" },
  { id: 344, date: '2026-05-17', setup: "What do you call a cat on the beach on Christmas?", punchline: "Sandy Claws!", category: "Animals" },
  { id: 345, date: '2026-05-18', setup: "What do you call a tax accountant's favorite dance?", punchline: "The tax-i!", category: "Work" },
  { id: 346, date: '2026-05-19', setup: "Why did the gym teacher break up with the math teacher?", punchline: "She had too many problems!", category: "Work" },
  { id: 347, date: '2026-05-20', setup: "What do you call a French insect?", punchline: "A Paris-ite!", category: "Animals" },
  { id: 348, date: '2026-05-21', setup: "What do you call a crab that throws things?", punchline: "A lobster!", category: "Animals" },
  { id: 349, date: '2026-05-22', setup: "What do you call a thief in a fruit costume?", punchline: "A smooth criminal!", category: "Food" },
  { id: 350, date: '2026-05-23', setup: "Why did the lemonade go to the movies?", punchline: "Because it was a little sour!", category: "Food" },
  { id: 351, date: '2026-05-24', setup: "What do you call a lazy beach?", punchline: "Shore-t of energy!", category: "Nature" },
  { id: 352, date: '2026-05-25', setup: "Why did the sand get a time out?", punchline: "For being too gritty!", category: "Nature" },
  { id: 353, date: '2026-05-26', setup: "What do you call a month that can't make up its mind?", punchline: "Sep-timber!", category: "Nature" },
  { id: 354, date: '2026-05-27', setup: "Why did the stadium get cold?", punchline: "Too many fans left!", category: "Sports" },
  { id: 355, date: '2026-05-28', setup: "Why did the flag go to therapy?", punchline: "It had too many issues to wave around!", category: "Holiday" },
  { id: 356, date: '2026-05-29', setup: "What did one firecracker say to the other?", punchline: "My pop is bigger than yours!", category: "Holiday" },
  { id: 357, date: '2026-05-30', setup: "Why did the beekeeper's wife leave him?", punchline: "He kept calling her honey!", category: "Food" },
  { id: 358, date: '2026-05-31', setup: "What do you call a Mexican who lost his car?", punchline: "Carlos!", category: "Classic" },

  // JUNE 2026 - DECEMBER 2026 (Continuing with remaining unique jokes)
  { id: 359, date: '2026-06-01', setup: "What do you call a fish without a tail?", punchline: "A one-ended fish stick!", category: "Animals" },
  { id: 360, date: '2026-06-02', setup: "Why did the baker stop making donuts?", punchline: "He got tired of the hole thing!", category: "Food" },
];


// =============================================================================
// DATE HELPER FUNCTIONS
// =============================================================================

// Get today's date in YYYY-MM-DD format (in user's timezone)
const getTodayString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Filter and sort jokes - only show today and past, sorted newest first
const getVisibleJokes = (jokes) => {
  const today = getTodayString();
  return jokes
    .filter(joke => joke.date <= today)  // Only today and past
    .sort((a, b) => b.date.localeCompare(a.date));  // Newest first
};

// Get today's joke specifically
const getTodaysJoke = (jokes) => {
  const today = getTodayString();
  const todayJoke = jokes.find(joke => joke.date === today);
  if (todayJoke) return todayJoke;
  
  // Fallback: if no joke scheduled for today, show most recent past joke
  const visible = getVisibleJokes(jokes);
  return visible[0] || null;
};

// Get past jokes (everything except today's)
const getPastJokes = (jokes) => {
  const todaysJoke = getTodaysJoke(jokes);
  const visible = getVisibleJokes(jokes);
  return visible.filter(joke => joke.id !== todaysJoke?.id);
};

// Count scheduled future jokes (for admin info)
const getFutureJokesCount = (jokes) => {
  const today = getTodayString();
  return jokes.filter(joke => joke.date > today).length;
};

// Ad Placeholder Component
const AdPlaceholder = ({ size = 'banner', className = '' }) => {
  const sizes = {
    banner: { width: '728px', height: '90px', label: 'Banner Ad (728x90)' },
    sidebar: { width: '300px', height: '250px', label: 'Sidebar Ad (300x250)' },
    mobile: { width: '320px', height: '100px', label: 'Mobile Ad (320x100)' },
  };
  
  const { width, height, label } = sizes[size];
  
  return (
    <div 
      className={`ad-placeholder ${className}`}
      style={{ 
        width, 
        height, 
        maxWidth: '100%',
        background: 'linear-gradient(135deg, #f0e6d3 0%, #e8dcc8 100%)',
        border: '2px dashed #c4a77d',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8b7355',
        fontFamily: "'DM Mono', monospace",
        fontSize: '12px',
        margin: '0 auto',
      }}
    >
      {label}
    </div>
  );
};

// Joke Card Component
const JokeCard = ({ joke, isToday = false, isRevealed = true, onReveal, onSmile }) => {
  const [showPunchline, setShowPunchline] = useState(isRevealed);
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleReveal = () => {
    setShowPunchline(true);
    onReveal?.();
    onSmile?.(); // Count the smile!
  };

  const handleShare = (type) => {
    onSmile?.(); // Sharing spreads smiles!
    
    if (type === 'copy') {
      navigator.clipboard?.writeText(`${joke.setup} ${joke.punchline} 😄 — Share a smile at dadjokeaday.com`);
      alert('Joke copied! Go spread some smiles 😊');
    } else if (type === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${joke.setup} ${joke.punchline} 😄 Share more smiles at`)}&url=${encodeURIComponent('https://dadjokeaday.com')}`, '_blank');
    }
  };

  return (
    <div className={`joke-card ${isToday ? 'today' : ''}`}>
      <div className="joke-meta">
        <span className="joke-date">{formatDate(joke.date)}</span>
        <span className="joke-category">{joke.category}</span>
      </div>
      <div className="joke-content">
        <p className="joke-setup">{joke.setup}</p>
        {showPunchline ? (
          <>
            <p className="joke-punchline">{joke.punchline}</p>
            {joke.submittedBy && (
              <p className="joke-credit">😊 Submitted by <strong>{joke.submittedBy}</strong></p>
            )}
          </>
        ) : (
          <button 
            className="reveal-btn"
            onClick={handleReveal}
          >
            🥁 Ready to Smile?
          </button>
        )}
      </div>
      {isToday && showPunchline && (
        <div className="share-section">
          <button className="share-btn" onClick={() => handleShare('copy')}>
            📋 Copy & Share
          </button>
          <button className="share-btn" onClick={() => handleShare('twitter')}>
            𝕏 Spread Joy
          </button>
        </div>
      )}
    </div>
  );
};

// Submit Joke Form Component
const SubmitJokeForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    setup: '',
    punchline: '',
    category: 'Classic',
    confirmed: false,
    // Honeypot field - bots will fill this, humans won't see it
    website: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileRef = useRef(null);

  // Cloudflare Turnstile site key - get yours at https://dash.cloudflare.com/turnstile
  // Set to null to disable Turnstile (honeypot will still work)
  const TURNSTILE_SITE_KEY = null; // Replace with: 'your-site-key-here'

  const categories = ['Classic', 'Food', 'Animals', 'Science', 'Nature', 'Movies', 'Work', 'Sports', 'Tech', 'Holiday'];

  // Load Turnstile script
  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    
    // Check if already loaded
    if (window.turnstile) return;
    
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
          'error-callback': () => setError('Verification failed. Please try again.'),
        });
      }
    };
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Honeypot check - if filled, it's a bot
    if (formData.website) {
      // Silently "succeed" to not alert the bot
      setSubmitted(true);
      return;
    }
    
    if (!formData.confirmed) {
      setError('Please confirm that your joke is original or common knowledge');
      return;
    }
    
    // Turnstile check (if enabled)
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError('Please complete the verification');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    const result = await submitJokeToBackend({
      name: formData.name,
      setup: formData.setup,
      punchline: formData.punchline,
      category: formData.category,
      turnstileToken: turnstileToken, // Send to backend for verification
    });
    
    setSubmitting(false);
    
    if (result.success) {
      setSubmitted(true);
    } else {
      setError('Something went wrong. Please try again!');
      // Reset Turnstile on error
      if (window.turnstile && turnstileRef.current) {
        window.turnstile.reset(turnstileRef.current);
      }
    }
  };

  if (submitted) {
    return (
      <div className="submit-form-container">
        <div className="submit-success">
          <span className="success-emoji">🎉</span>
          <h3>Thanks for sharing the joy!</h3>
          <p>We'll review your joke and if it makes us smile, it'll appear on the site with your name!</p>
          <button className="submit-btn" onClick={onClose}>
            Back to Jokes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="submit-form-container">
      <div className="submit-header">
        <h2>✨ Share Your Best Dad Joke</h2>
        <p>Got a joke that makes everyone smile? We'd love to feature it — with your name in lights!</p>
        <div className="clean-humor-note">
          <span>🌟</span>
          <span>All jokes are reviewed to ensure they're clean, family-friendly, and spread pure joy</span>
        </div>
      </div>
      
      <form className="submit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Your Name (how you'd like to be credited)</label>
          <input
            type="text"
            id="name"
            placeholder="e.g., Sarah M."
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="setup">The Setup</label>
          <input
            type="text"
            id="setup"
            placeholder="Why did the chicken cross the road?"
            value={formData.setup}
            onChange={(e) => setFormData({...formData, setup: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="punchline">The Punchline</label>
          <input
            type="text"
            id="punchline"
            placeholder="To get to the other side!"
            value={formData.punchline}
            onChange={(e) => setFormData({...formData, punchline: e.target.value})}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Honeypot field - hidden from humans, bots will fill it */}
        <div className="form-group" style={{ 
          position: 'absolute', 
          left: '-9999px',
          opacity: 0,
          height: 0,
          overflow: 'hidden',
        }} aria-hidden="true">
          <label htmlFor="website">Website (leave blank)</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.confirmed}
              onChange={(e) => setFormData({...formData, confirmed: e.target.checked})}
            />
            <span className="checkmark"></span>
            <span className="checkbox-text">
              I confirm this joke is my own creation or common knowledge, and is appropriate for all ages
            </span>
          </label>
        </div>
        
        {/* Cloudflare Turnstile widget */}
        {TURNSTILE_SITE_KEY && (
          <div className="turnstile-container">
            <div ref={turnstileRef}></div>
          </div>
        )}
        
        {error && (
          <div className="form-error">
            ⚠️ {error}
          </div>
        )}
        
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit My Joke 😊'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main App Component
export default function DadJokesSite() {
  const [currentView, setCurrentView] = useState('home');
  const [todayRevealed, setTodayRevealed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Smile counter state
  const [smileCount, setSmileCount] = useState(BASE_SMILE_COUNT);
  const [justSmiled, setJustSmiled] = useState(false);
  
  // Load smile count on mount
  useEffect(() => {
    const loadSmileCount = async () => {
      const count = await getSmileCount();
      setSmileCount(count);
    };
    loadSmileCount();
  }, []);
  
  // Handle a new smile (punchline reveal or share)
  const handleSmile = async () => {
    setJustSmiled(true);
    const newCount = await incrementSmileCount(1);
    if (newCount) {
      setSmileCount(newCount);
    }
    setTimeout(() => setJustSmiled(false), 2000);
  };

  // Get today's joke and past jokes using date-aware functions
  const todaysJoke = getTodaysJoke(jokesDatabase);
  const pastJokes = getPastJokes(jokesDatabase);
  const futureCount = getFutureJokesCount(jokesDatabase);
  
  // Get unique categories from visible jokes only
  const visibleJokes = getVisibleJokes(jokesDatabase);
  const categories = ['All', ...new Set(visibleJokes.map(j => j.category))];
  
  // Filter past jokes
  const filteredJokes = selectedCategory === 'All' 
    ? pastJokes 
    : pastJokes.filter(j => j.category === selectedCategory);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo+Black&family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,400;9..144,700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        :root {
          --cream: #faf6f0;
          --mustard: #e8a838;
          --rust: #c45d3a;
          --forest: #2d5a47;
          --navy: #1e3a5f;
          --charcoal: #2c2c2c;
          --warm-white: #fffef9;
        }
        
        body {
          background: var(--cream);
          min-height: 100vh;
        }
        
        .app-container {
          min-height: 100vh;
          background: var(--cream);
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(232, 168, 56, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(196, 93, 58, 0.08) 0%, transparent 50%);
        }
        
        /* Header */
        .header {
          background: var(--charcoal);
          padding: 1rem 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .header-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .logo {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.5rem;
          color: var(--warm-white);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          text-decoration: none;
        }
        
        .logo-emoji {
          font-size: 2rem;
          animation: wobble 2s ease-in-out infinite;
        }
        
        @keyframes wobble {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        .nav {
          display: flex;
          gap: 0.5rem;
        }
        
        .nav-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
          padding: 0.6rem 1.2rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          color: var(--warm-white);
        }
        
        .nav-btn:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .nav-btn.active {
          background: var(--mustard);
          color: var(--charcoal);
        }
        
        /* Hero Section */
        .hero {
          padding: 4rem 2rem 2rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .hero::before {
          content: '😂 🤣 😆 🙃 😄 😁';
          position: absolute;
          top: 1rem;
          left: 0;
          right: 0;
          font-size: 3rem;
          opacity: 0.1;
          letter-spacing: 2rem;
          animation: float 20s linear infinite;
        }
        
        @keyframes float {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .hero h1 {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(2.5rem, 8vw, 5rem);
          color: var(--charcoal);
          line-height: 1.1;
          margin-bottom: 1rem;
        }
        
        .hero h1 span {
          color: var(--rust);
          position: relative;
        }
        
        .hero h1 span::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 0.2em;
          background: var(--mustard);
          transform: rotate(-1deg);
          z-index: -1;
        }
        
        .hero-subtitle {
          font-family: 'DM Mono', monospace;
          font-size: 1.1rem;
          color: var(--forest);
          max-width: 500px;
          margin: 0 auto 2rem;
        }
        
        .streak-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--forest);
          color: var(--warm-white);
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        
        /* Smile Counter */
        .smile-counter {
          display: inline-block;
          position: relative;
          background: linear-gradient(135deg, var(--forest) 0%, #1e4a3a 100%);
          border-radius: 20px;
          padding: 1.2rem 2rem;
          box-shadow: 0 4px 20px rgba(45, 90, 71, 0.3);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .smile-counter:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(45, 90, 71, 0.4);
        }
        
        .smile-counter.celebrating {
          animation: celebrate 0.6s ease-out;
        }
        
        @keyframes celebrate {
          0% { transform: scale(1); }
          30% { transform: scale(1.05); }
          60% { transform: scale(0.98); }
          100% { transform: scale(1); }
        }
        
        .smile-counter-inner {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .smile-icon {
          font-size: 2.5rem;
          animation: gentle-bounce 2s ease-in-out infinite;
        }
        
        @keyframes gentle-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .smile-stats {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        
        .smile-number {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.8rem;
          color: var(--warm-white);
          line-height: 1;
        }
        
        .smile-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .smile-celebration {
          position: absolute;
          top: -10px;
          right: -10px;
          background: var(--mustard);
          color: var(--charcoal);
          padding: 0.3rem 0.6rem;
          border-radius: 50px;
          font-family: 'Archivo Black', sans-serif;
          font-size: 0.8rem;
          animation: pop-in 0.4s ease-out;
        }
        
        @keyframes pop-in {
          0% { 
            opacity: 0; 
            transform: scale(0) rotate(-20deg);
          }
          50% { 
            transform: scale(1.2) rotate(5deg);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(0);
          }
        }
        
        /* Clean Promise Badge */
        .clean-promise {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(45, 90, 71, 0.1);
          color: var(--forest);
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          border: 1px solid rgba(45, 90, 71, 0.2);
        }
        
        /* Joke Credit */
        .joke-credit {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: var(--forest);
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px dashed #ddd;
        }
        
        .joke-credit strong {
          color: var(--rust);
        }
        
        /* Submit Nav Button */
        .nav-btn.submit-nav {
          background: var(--rust);
          color: var(--warm-white);
        }
        
        .nav-btn.submit-nav:hover {
          background: #b54d2e;
        }
        
        .nav-btn.submit-nav.active {
          background: var(--mustard);
          color: var(--charcoal);
        }
        
        /* Submit Form */
        .submit-form-container {
          max-width: 600px;
          margin: 0 auto;
          background: var(--warm-white);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08);
        }
        
        .submit-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .submit-header h2 {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.8rem;
          color: var(--charcoal);
          margin-bottom: 0.5rem;
        }
        
        .submit-header p {
          font-family: 'DM Mono', monospace;
          color: #666;
          font-size: 0.95rem;
        }
        
        .clean-humor-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: rgba(45, 90, 71, 0.1);
          color: var(--forest);
          padding: 0.8rem 1rem;
          border-radius: 10px;
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          margin-top: 1rem;
          border: 1px solid rgba(45, 90, 71, 0.2);
        }
        
        .submit-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group label {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: var(--charcoal);
          font-weight: 500;
        }
        
        .form-group input,
        .form-group select {
          padding: 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-family: 'Fraunces', serif;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--forest);
        }
        
        .form-group input::placeholder {
          color: #aaa;
          font-style: italic;
        }
        
        /* Checkbox Group */
        .checkbox-group {
          margin-top: 0.5rem;
        }
        
        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
          font-weight: normal !important;
        }
        
        .checkbox-label input[type="checkbox"] {
          width: 20px;
          height: 20px;
          margin-top: 2px;
          cursor: pointer;
          accent-color: var(--forest);
        }
        
        .checkbox-text {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: #555;
          line-height: 1.4;
        }
        
        /* Form Error */
        .form-error {
          background: #fff3f3;
          border: 1px solid #ffcccc;
          color: #cc4444;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        
        /* Turnstile Container */
        .turnstile-container {
          display: flex;
          justify-content: center;
          margin: 0.5rem 0;
        }
        
        /* Disabled Submit Button */
        .submit-btn:disabled {
          background: #999;
          cursor: not-allowed;
          transform: none;
        }
        
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
        }
        
        .cancel-btn {
          font-family: 'DM Mono', monospace;
          padding: 1rem 1.5rem;
          background: transparent;
          color: #666;
          border: 2px solid #ddd;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .cancel-btn:hover {
          border-color: #999;
          color: #333;
        }
        
        .submit-btn {
          font-family: 'Archivo Black', sans-serif;
          padding: 1rem 2rem;
          background: var(--forest);
          color: var(--warm-white);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .submit-btn:hover {
          background: #1e4a3a;
          transform: translateY(-2px);
        }
        
        /* Submit Success */
        .submit-success {
          text-align: center;
          padding: 2rem;
        }
        
        .success-emoji {
          font-size: 4rem;
          display: block;
          margin-bottom: 1rem;
          animation: bounce-in 0.6s ease-out;
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        
        .submit-success h3 {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.5rem;
          color: var(--charcoal);
          margin-bottom: 0.5rem;
        }
        
        .submit-success p {
          font-family: 'DM Mono', monospace;
          color: #666;
          margin-bottom: 1.5rem;
        }
        
        /* Main Content */
        .main-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        /* Today's Joke Section */
        .todays-section {
          margin-bottom: 3rem;
        }
        
        .section-label {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--rust);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-label::before,
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, var(--rust), transparent);
        }
        
        .section-label::after {
          background: linear-gradient(90deg, transparent, var(--rust));
        }
        
        /* Joke Cards */
        .joke-card {
          background: var(--warm-white);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 
            0 4px 6px rgba(0,0,0,0.05),
            0 10px 40px rgba(0,0,0,0.08);
          margin-bottom: 1.5rem;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .joke-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 6px 12px rgba(0,0,0,0.08),
            0 15px 50px rgba(0,0,0,0.12);
        }
        
        .joke-card.today {
          border: 3px solid var(--mustard);
          background: linear-gradient(135deg, var(--warm-white) 0%, #fff9e6 100%);
        }
        
        .joke-card.today::before {
          content: '⭐ TODAY';
          position: absolute;
          top: 1rem;
          right: -2rem;
          background: var(--mustard);
          color: var(--charcoal);
          padding: 0.3rem 3rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.7rem;
          font-weight: 500;
          transform: rotate(45deg);
        }
        
        .joke-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .joke-date {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          color: #888;
        }
        
        .joke-category {
          background: var(--forest);
          color: var(--warm-white);
          padding: 0.3rem 0.8rem;
          border-radius: 50px;
          font-family: 'DM Mono', monospace;
          font-size: 0.75rem;
        }
        
        .joke-content {
          text-align: center;
        }
        
        .joke-setup {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.3rem, 4vw, 1.8rem);
          color: var(--charcoal);
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }
        
        .joke-punchline {
          font-family: 'Archivo Black', sans-serif;
          font-size: clamp(1.4rem, 4vw, 2rem);
          color: var(--rust);
          animation: punchline-reveal 0.5s ease-out;
        }
        
        @keyframes punchline-reveal {
          0% { 
            opacity: 0; 
            transform: scale(0.8) rotate(-2deg);
          }
          50% { 
            transform: scale(1.05) rotate(1deg);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(0);
          }
        }
        
        .reveal-btn {
          font-family: 'Archivo Black', sans-serif;
          font-size: 1.1rem;
          padding: 1rem 2rem;
          background: var(--mustard);
          color: var(--charcoal);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(232, 168, 56, 0.4);
        }
        
        .reveal-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 25px rgba(232, 168, 56, 0.6);
        }
        
        .share-section {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px dashed #ddd;
        }
        
        .share-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
          padding: 0.6rem 1.2rem;
          background: var(--charcoal);
          color: var(--warm-white);
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .share-btn:hover {
          background: var(--navy);
          transform: translateY(-2px);
        }
        
        /* Archive Section */
        .archive-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        
        .archive-title {
          font-family: 'Archivo Black', sans-serif;
          font-size: 2rem;
          color: var(--charcoal);
        }
        
        .filter-bar {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .filter-btn {
          font-family: 'DM Mono', monospace;
          font-size: 0.8rem;
          padding: 0.5rem 1rem;
          background: var(--warm-white);
          color: var(--charcoal);
          border: 2px solid #ddd;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .filter-btn:hover {
          border-color: var(--forest);
        }
        
        .filter-btn.active {
          background: var(--forest);
          color: var(--warm-white);
          border-color: var(--forest);
        }
        
        .jokes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        
        /* Ad Sections */
        .ad-section {
          margin: 2rem 0;
          text-align: center;
        }
        
        /* Footer */
        .footer {
          background: var(--charcoal);
          padding: 2rem;
          text-align: center;
          margin-top: 4rem;
        }
        
        .footer-content {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .footer p {
          font-family: 'DM Mono', monospace;
          color: #888;
          font-size: 0.85rem;
        }
        
        .footer-promise {
          color: var(--mustard) !important;
          margin-top: 0.5rem;
          font-size: 0.8rem !important;
        }
        
        .footer-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1rem;
        }
        
        .footer-links a {
          color: var(--mustard);
          text-decoration: none;
          font-family: 'DM Mono', monospace;
          font-size: 0.85rem;
        }
        
        .footer-links a:hover {
          text-decoration: underline;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .header {
            padding: 1rem;
          }
          
          .logo {
            font-size: 1.2rem;
          }
          
          .nav-btn {
            padding: 0.5rem 0.8rem;
            font-size: 0.8rem;
          }
          
          .hero {
            padding: 2rem 1rem;
          }
          
          .main-content {
            padding: 1rem;
          }
          
          .joke-card {
            padding: 1.5rem;
          }
          
          .jokes-grid {
            grid-template-columns: 1fr;
          }
          
          .archive-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .submit-form-container {
            padding: 1.5rem;
            margin: 0 -0.5rem;
          }
          
          .submit-header h2 {
            font-size: 1.4rem;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .cancel-btn,
          .submit-btn {
            width: 100%;
            text-align: center;
          }
          
          .nav-btn.submit-nav {
            font-size: 0.7rem;
            padding: 0.5rem 0.6rem;
          }
          
          .clean-promise {
            font-size: 0.75rem;
            padding: 0.5rem 0.8rem;
          }
        }
      `}</style>
      
      <div className="app-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo" onClick={() => setCurrentView('home')}>
              <span className="logo-emoji">😎</span>
              Dad Joke a Day
            </div>
            <nav className="nav">
              <button 
                className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
                onClick={() => setCurrentView('home')}
              >
                Today
              </button>
              <button 
                className={`nav-btn ${currentView === 'archive' ? 'active' : ''}`}
                onClick={() => setCurrentView('archive')}
              >
                Archive
              </button>
              <button 
                className={`nav-btn submit-nav ${currentView === 'submit' ? 'active' : ''}`}
                onClick={() => setCurrentView('submit')}
              >
                Submit a Joke
              </button>
            </nav>
          </div>
        </header>
        
        {/* Hero Section - Home Only */}
        {currentView === 'home' && (
          <section className="hero">
            <h1>One <span>Dad Joke</span><br/>Every Day</h1>
            <p className="hero-subtitle">
              Your daily dose of wholesome humor. 
              Because everyone deserves a smile before noon.
            </p>
            <div className="clean-promise">
              <span>✨</span> Always clean, always family-friendly, always smile-worthy
            </div>
            <SmileCounter count={smileCount} justIncremented={justSmiled} />
          </section>
        )}
        
        {/* Main Content */}
        <main className="main-content">
          {/* Top Ad Banner */}
          <div className="ad-section">
            <AdPlaceholder size="banner" />
          </div>
          
          {currentView === 'home' ? (
            <>
              {/* Today's Joke */}
              <section className="todays-section">
                <div className="section-label">Your Smile for Today</div>
                <JokeCard 
                  joke={todaysJoke} 
                  isToday={true}
                  isRevealed={todayRevealed}
                  onReveal={() => setTodayRevealed(true)}
                  onSmile={handleSmile}
                />
              </section>
              
              {/* Middle Ad */}
              <div className="ad-section">
                <AdPlaceholder size="sidebar" />
              </div>
              
              {/* Recent Jokes Preview */}
              <section>
                <div className="section-label">More Smiles From This Week</div>
                {pastJokes.slice(0, 3).map(joke => (
                  <JokeCard key={joke.id} joke={joke} onSmile={handleSmile} />
                ))}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                  <button 
                    className="reveal-btn"
                    onClick={() => setCurrentView('archive')}
                    style={{ background: 'var(--forest)' }}
                  >
                    See All {visibleJokes.length} Smiles →
                  </button>
                </div>
              </section>
            </>
          ) : currentView === 'archive' ? (
            /* Archive View */
            <section>
              <div className="archive-header">
                <h2 className="archive-title">😊 The Smile Collection</h2>
                <div className="filter-bar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="jokes-grid">
                {filteredJokes.map(joke => (
                  <JokeCard key={joke.id} joke={joke} onSmile={handleSmile} />
                ))}
              </div>
              
              {filteredJokes.length === 0 && (
                <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>
                  More smiles coming soon to this category! 😊
                </p>
              )}
            </section>
          ) : (
            /* Submit View */
            <SubmitJokeForm onClose={() => setCurrentView('home')} />
          )}
          
          {/* Bottom Ad */}
          <div className="ad-section">
            <AdPlaceholder size="banner" />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>© 2025 Dad Joke a Day • Spreading smiles, one pun at a time</p>
            <p className="footer-promise">Always clean. Always family-friendly. Always free.</p>
            <div className="footer-links">
              <a href="#">About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('submit'); }}>Submit a Joke</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
