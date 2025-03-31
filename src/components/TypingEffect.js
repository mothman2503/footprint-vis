import { useState, useEffect } from "react";

const TypingEffect = ({ words, speed = 100, delay = 1000, disableSpaces = false, onComplete }) => {
    const [displayedText, setDisplayedText] = useState(""); // Stores final text (prevents reset)
    const [currentWord, setCurrentWord] = useState(""); // Stores the currently typing word
    const [wordIndex, setWordIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        if (wordIndex < words.length) {
            if (charIndex < words[wordIndex].length) {
                const timeout = setTimeout(() => {
                    setCurrentWord((prev) => prev + words[wordIndex][charIndex]); // Type each letter
                    setCharIndex(charIndex + 1);
                }, speed);
                return () => clearTimeout(timeout);
            } else {
                setTimeout(() => {
                    setDisplayedText((prev) => prev + currentWord + (disableSpaces ? "" : " ")); // Store typed word
                    setCurrentWord(""); // Reset for next word
                    if (wordIndex === words.length - 1) {
                        onComplete?.(); // Trigger next effect
                    } else {
                        setWordIndex(wordIndex + 1);
                        setCharIndex(0);
                    }
                }, delay);
            }
        }
    }, [charIndex, wordIndex, words, speed, delay, disableSpaces, onComplete, currentWord]);

    return <span>{displayedText + currentWord}</span>; // Show completed words + currently typing word
};

export default TypingEffect;
