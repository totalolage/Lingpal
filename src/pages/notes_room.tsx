import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import BackgroundTemplate from "@/components/BackgroundTemplate";
import WhiteboardTemplate from "@/components/WhiteboardTemplate";
import { useGameStore } from "@/stores/GameStore";
import { useSocketContext } from "@/contexts/SocketContext";
import { useAuthStore } from "@/stores/AuthStore";
import { NOTE_TIME } from "@/utils/constants";
import { Postit } from "@/components/NotesRoom/Postit";
import { EditingNote } from "@/components/NotesRoom/EditingNote";
import { useCountdownTimer } from "@/components/NotesRoom/useCountdownTimer";
import { useNotes } from "@/components/NotesRoom/useNotes";
import { emitSocketEvent } from "@/utils/helpers";
import { useRegisterSocketListener } from "@/hooks/useRegisterSocketListener";

export default function NoteRoom() {
  const { players, describerIndex, setDescriberIndex, round, leaveNoteRoom } =
    useGameStore();

  const { socket } = useSocketContext();
  const { user, updatePlayerScore } = useAuthStore();

  const { notes, activeNote, setActiveNoteIndex, saveNote } = useNotes();

  const router = useRouter();
  const navigate = router.push;

  const word = players[user!.id].words
    ? (players[user!.id].words as string[])[round]
    : "";

  const { formattedTime } = useCountdownTimer(
    NOTE_TIME,
    notes,
    () => {
      const writtenNotes = notes.filter((note) => note !== "");
      emitSocketEvent(socket, "save-notes", writtenNotes);
      router.push("/game_room");
    },
    true
  );

  const playerLeftListener = useCallback(
    (disconnectingPlayer: SocketEvent["player-left"]) => {
      leaveNoteRoom(disconnectingPlayer);
      if (disconnectingPlayer.order === describerIndex) {
        const nextPlayer = Object.values(players).find(
          (p) => p.order > disconnectingPlayer.order
        );
        setDescriberIndex(nextPlayer!.order);
      }
    },
    [describerIndex, leaveNoteRoom, players, setDescriberIndex]
  );

  useRegisterSocketListener("player-left", playerLeftListener);

  const leaveGame = () => {
    socket?.disconnect();
    updatePlayerScore({ total: 1 });
    navigate("/dashboard");
  };

  return (
    <BackgroundTemplate>
      <WhiteboardTemplate>
        <div className="grid h-full w-full gap-6 grid-rows-layout2 relative">
          <button
            onClick={() => leaveGame()}
            className="absolute top-0 left-0 py-1 px-2 rounded-lg bg-red-600 text-white font-semibold text-sm sm:text-base z-10"
          >
            Quit
          </button>
          <div>
            <h2 className="uppercase text-center text-white md:text-lg">
              Your Word
            </h2>
            <h1 className="capitalize my-2 text-2xl md:text-4xl text-white drop-shadow-2xl text-center font-semibold">
              {word}
            </h1>
          </div>
          <div className="w-full grid grid-rows-layout5 gap-4">
            <p className="lg:text-lg">
              Before the game starts, take some time to write notes.
            </p>
            {notes && activeNote !== null ? (
              <EditingNote
                activeNote={activeNote}
                saveNote={saveNote}
                setActiveNote={setActiveNoteIndex}
              />
            ) : (
              notes && (
                <div className="h-full min-h-0 grid sm:grid-cols-2 sm:grid-rows-layout4 gap-4 md:gap-8 place-items-center">
                  {notes.map((note, i) => (
                    <Postit
                      key={i}
                      index={i}
                      note={note}
                      setActiveNote={setActiveNoteIndex}
                    />
                  ))}
                </div>
              )
            )}
          </div>
          <div className="w-full">
            <p className="text-center md:text-lg">
              Game starts in {formattedTime}
            </p>
          </div>
        </div>
      </WhiteboardTemplate>
    </BackgroundTemplate>
  );
}

NoteRoom.requireAuth = true;
