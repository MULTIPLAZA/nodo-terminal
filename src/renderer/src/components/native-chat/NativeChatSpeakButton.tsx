import { useCallback, useEffect, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { translate } from '@/i18n/i18n'
import { stripMarkdownForSpeech } from './strip-markdown-for-speech'

/**
 * Per-message "read aloud" affordance for the native chat, mirroring
 * NativeChatCopyButton. Uses the browser's built-in speechSynthesis (no
 * model download, no main-process/IPC involvement) so it works the same
 * whether the app runs locally or over a remote desktop session — audio
 * plays through whatever output device the OS/session has configured.
 * Starting a new read cancels any other utterance already playing, since
 * speechSynthesis is a single global queue.
 */
export function NativeChatSpeakButton({
  text,
  className
}: {
  text: string
  className?: string
}): React.JSX.Element | null {
  const [speaking, setSpeaking] = useState(false)
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  useEffect(() => {
    if (!speechSupported) {
      return
    }
    return () => {
      // Why: an unmounting row (e.g. transcript re-render) must not leave a
      // stale utterance narrating over whatever the user opens next.
      if (speaking) {
        window.speechSynthesis.cancel()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleToggle = useCallback(() => {
    if (!speechSupported) {
      return
    }
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    // Why cancel first: speechSynthesis has one global queue, so starting a
    // read on this row must interrupt whatever another row's button started.
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(stripMarkdownForSpeech(text))
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }, [speaking, speechSupported, text])

  if (!speechSupported) {
    return null
  }

  const label = speaking
    ? translate('components.native-chat.speakMessage.stop', 'Stop reading aloud')
    : translate('components.native-chat.speakMessage.speak', 'Read message aloud')

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        speaking && 'text-status-success',
        className
      )}
    >
      {speaking ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
    </button>
  )
}
