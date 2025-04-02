import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

const TypingEffect = ({ 
    words, 
    speed = 100, 
    delay = 1000, 
    initialDelay = 500, 
    disableSpaces = false, 
    disableCursor = false, 
    onComplete 
}) => {
    const { i18n } = useTranslation(); // Access the current language
    const [displayedText, setDisplayedText] = useState(""); 
    const [currentWord, setCurrentWord] = useState(""); 
    const [wordIndex, setWordIndex] = useState(-1);
    const [charIndex, setCharIndex] = useState(0);
    const [startTyping, setStartTyping] = useState(false);
    const [showCursor, setShowCursor] = useState(true);
    const [isTyping, setIsTyping] = useState(true); 

    const typingTimeoutRef = useRef(null); // Ref to store typing timeout
    const delayTimeoutRef = useRef(null); // Ref to store delay timeout

    // Reset typing effect when the language changes
    useEffect(() => {
        setDisplayedText("");
        setCurrentWord("");
        setWordIndex(-1);
        setCharIndex(0);
        setStartTyping(false);
        setIsTyping(true);

        const timer = setTimeout(() => {
            setStartTyping(true);
            setWordIndex(0);
        }, initialDelay);

        return () => clearTimeout(timer);
    }, [i18n.language, initialDelay]); // Trigger reset when the language changes

    useEffect(() => {
        if (!startTyping || wordIndex >= words.length) return;

        if (charIndex < words[wordIndex].length) {
            typingTimeoutRef.current = setTimeout(() => {
                setCurrentWord((prev) => prev + words[wordIndex][charIndex]);
                setCharIndex(charIndex + 1);
            }, speed);
        } else {
            delayTimeoutRef.current = setTimeout(() => {
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

        return () => {
            clearTimeout(typingTimeoutRef.current);
            clearTimeout(delayTimeoutRef.current);
        };
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
                    backgroundColor: (showCursor && isTyping && !disableCursor) ? "black" : "transparent",
                    marginLeft: "2px"
                }}></span>
        </span>
    );
};

export default TypingEffect;
