"use client";
import { motion, useAnimate } from "motion/react";
import { useCallback, useRef } from "react";
import Typewriter from "@/components/fancy/text/typewriter";
import { cn } from "@/lib/utils";

function ImageMotion({
  header = true,
  ...props
}: React.ComponentProps<"div"> & { header?: boolean }) {
  const [scope, animate] = useAnimate();
  const lastTextIndex = useRef(-1);
  const hasAnimatedFirst = useRef(false);
  const hasAnimatedSecond = useRef(false);
  const hasAnimatedThird = useRef(false);

  const texts = ["?h=1000&w=1200", "?h=1200&w=1600", "?f=grayscale"];

  const handleTextChange = useCallback(
    (_text: string, textIndex: number, isComplete: boolean) => {
      // Reset flags when starting new cycle (textIndex goes back to 0)
      if (textIndex === 0 && lastTextIndex.current !== 0) {
        hasAnimatedFirst.current = false;
        hasAnimatedSecond.current = false;
        hasAnimatedThird.current = false;
      }
      lastTextIndex.current = textIndex;

      // Animate height when first text completes
      if (textIndex === 0 && isComplete && !hasAnimatedFirst.current) {
        hasAnimatedFirst.current = true;
        animate(
          scope.current,
          { height: "70%", width: "80%", filter: "grayscale(0)" },
          { duration: 0.6, ease: [0.4, 0.3, 0.2, 1] },
        );
      }

      // Animate width when second text completes
      if (textIndex === 1 && isComplete && !hasAnimatedSecond.current) {
        hasAnimatedSecond.current = true;
        animate(
          scope.current,
          { height: "100%", width: "100%" },
          { duration: 0.6, ease: [0.4, 0.3, 0.2, 1] },
        );
      }
      if (textIndex === 2 && isComplete && !hasAnimatedThird.current) {
        hasAnimatedSecond.current = true;
        animate(
          scope.current,
          { height: "100%", width: "100%", filter: "grayscale(1)" },
          { duration: 0.6, ease: [0.4, 0.3, 0.2, 1] },
        );
      }
    },
    [animate, scope],
  );

  return (
    <div className={cn("bg-secondary p-0.5 space-y-0.5", props.className)}>
      {header && (
        <div className="text-balance bg-muted content-center px-2 h-12 font-mono flex items-center">
          <span className="text-muted-foreground">/bucket/image</span>
          <Typewriter
            text={texts}
            speed={80}
            deleteSpeed={40}
            waitTime={1500}
            loop={true}
            showCursor={true}
            cursorChar="|"
            className="inline"
            onTextChange={handleTextChange}
          />
        </div>
      )}
      <div className="h-96 sm:h-full flex items-start overflow-hidden bg-background/80 ">
        <motion.img
          ref={scope}
          initial={{
            height: "h-96",
            width: "100%",
            filter: "grayscale(0)",
          }}
          style={{
            objectFit: "cover",
            aspectRatio: "auto",
          }}
          className="origin-top-left"
          src={"https://images.unsplash.com/photo-1535467487981-c86a98db6b9c?auto=format&fit=crop"}
        />
      </div>
    </div>
  );
}

export default ImageMotion;
