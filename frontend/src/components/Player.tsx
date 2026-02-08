/**
 * YouTube IFrame Player.
 * Wraps the standard YouTube embed and allows 'Seeking' to specific times
 * using the YouTube IFrame API's postMessage communication.
 */
import { useRef, useImperativeHandle, forwardRef } from "react";

export interface PlayerHandle {
    seekTo: (seconds: number) => void;
}

interface PlayerProps {
    videoId: string;
}

export const Player = forwardRef<PlayerHandle, PlayerProps>(({ videoId }, ref) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // useImperativeHandle allows the parent component (page.tsx) 
    // to call the 'seekTo' function inside this component.
    useImperativeHandle(ref, () => ({
        seekTo: (seconds: number) => {
            if (iframeRef.current) {
                // Use postMessage to communicate with YouTube IFrame
                iframeRef.current.contentWindow?.postMessage(
                    JSON.stringify({ event: "command", func: "seekTo", args: [seconds, true] }),
                    "*"
                );
                iframeRef.current.contentWindow?.postMessage(
                    JSON.stringify({ event: "command", func: "playVideo", args: [] }),
                    "*"
                );
            }
        },
    }));

    return (
        <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl border border-white/5">
            <iframe
                ref={iframeRef}
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&autoplay=0&enablejsapi=1`}
                title="YouTube Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
            />
        </div>
    );
});

Player.displayName = "Player";
