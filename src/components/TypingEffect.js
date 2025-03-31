import { useState, useEffect } from "react";

const TypingEffect = ({ 
    words, 
    speed = 100, 
    delay = 1000, 
    initialDelay = 500, 
    disableSpaces = false, 
    onComplete 
}) => {
    const [displayedText, setDisplayedText] = useState(""); 
    const [currentWord, setCurrentWord] = useState(""); 
    const [wordIndex, setWordIndex] = useState(-1);
    const [charIndex, setCharIndex] = useState(0);
    const [startTyping, setStartTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [isTyping, setIsTyping] = useState(true); 

    useEffect(() => {
        const timer = setTimeout(() => {
            setStartTyping(true);
            setWordIndex(0);
        }, initialDelay);
        return () => clearTimeout(timer);
    }, [initialDelay]);

    useEffect(() => {
        if (!startTyping || wordIndex >= words.length) return;

        if (charIndex < words[wordIndex].length) {
            const timeout = setTimeout(() => {
                setCurrentWord((prev) => prev + words[wordIndex][charIndex]);
                setCharIndex(charIndex + 1);
            }, speed);
            return () => clearTimeout(timeout);
        } else {
            setTimeout(() => {
                setDisplayedText((prev) => prev + currentWord + (disableSpaces ? "" : " "));
                setCurrentWord("");
                if (wordIndex === words.length - 1) {
                    setIsTyping(false);
                    onComplete?.();
                } else {
                    setWordIndex(wordIndex + 1);
                    setCharIndex(0);
                }
            }, delay);
        }
    }, [charIndex, wordIndex, words, speed, delay, disableSpaces, onComplete, currentWord, startTyping]);

    useEffect(() => {
        if (!isTyping) return;
        const cursorInterval = setInterval(() => {
            setShowCursor((prev) => !prev);
        }, 200);
        return () => clearInterval(cursorInterval);
    }, [isTyping]);

    return (
        <span>
            {displayedText + currentWord}
            <span style={{
                    display: "inline-block",
                    width: "8px",
                    height: "18px",
                    backgroundColor: (showCursor && isTyping) ? "black" : "transparent",
                    marginLeft: "2px"
                }}></span>
        </span>
    );
};

export default TypingEffect;
