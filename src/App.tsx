import { useEffect, useMemo } from 'react';
import { useGameSession } from './hooks/useGameSession';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { DealingPhase } from './components/DealingPhase';
import { GameBoard } from './components/GameBoard';
import { FeltBackground } from './components/FeltBackground';
import { BrandLogo } from './components/BrandLogo';
import { BrandName } from './components/BrandName';
import { RoomSocialProvider } from './context/RoomSocialContext';
import { getInviteCodeFromUrl } from './utils/roomInvite';
import { GameAudioBridge } from './components/GameAudioBridge';

function ReconnectingScreen() {
  return (
    <FeltBackground className="flex items-center justify-center p-4" decorative={false} variant="lobby">
      <div className="text-center space-y-5">
        <BrandLogo size="xl" withGlow className="mx-auto animate-pulse" />
        <div>
          <BrandName size="lg" as="h2" className="block mb-1" />
          <p className="text-gold-400/80 font-display text-sm font-medium mb-2">
            Reconnecting...
          </p>
          <p className="text-white/50 text-sm max-w-xs mx-auto">
            Restoring your game session. Please wait.
          </p>
        </div>
        <div className="flex justify-center gap-1.5 pt-2">
          <span className="w-2 h-2 rounded-full bg-gold-400/60 animate-bounce [animation-delay:0ms]" />
          <span className="w-2 h-2 rounded-full bg-gold-400/60 animate-bounce [animation-delay:150ms]" />
          <span className="w-2 h-2 rounded-full bg-gold-400/60 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </FeltBackground>
  );
}

function App() {
  const session = useGameSession();
  const inviteCode = useMemo(() => getInviteCodeFromUrl(), []);

  const demoHint =
    session.isDemo && session.demoHint ? session.demoHint : null;

  const handleLeave = async () => {
    if (session.isDemo || session.gameState?.phase === 'finished') {
      await session.leaveRoom();
      return;
    }

    const confirmed = window.confirm(
      'Leave this game? You will forfeit your seat and others can continue without you.'
    );
    if (confirmed) {
      await session.leaveRoom();
    }
  };

  useEffect(() => {
    if (session.gameState?.phase !== 'finished') return;

    const timer = window.setTimeout(() => {
      void session.leaveRoom();
    }, 3000);

    return () => clearTimeout(timer);
  }, [session.gameState?.phase, session.leaveRoom]);

  if (session.reconnecting && !session.gameState) {
    return (
      <>
        <GameAudioBridge gameState={null} />
        <ReconnectingScreen />
      </>
    );
  }

  if (!session.gameState) {
    return (
      <>
        <GameAudioBridge gameState={null} />
        <Lobby
        connected={session.connected}
        initialJoinCode={inviteCode}
        onCreateRoom={(name, picture) => session.createRoom(name, picture)}
        onJoinRoom={(code, name, picture) => session.joinRoom(code, name, picture)}
        onPeekRoom={(code) => session.peekRoom(code)}
        onStartDemo={() => session.startDemo()}
        error={session.error}
      />
      </>
    );
  }

  return (
    <>
      <GameAudioBridge gameState={session.gameState} />
      {session.gameState.phase === 'waiting' && (
        <RoomSocialProvider
          socket={session.isDemo ? null : session.socket ?? null}
          enabled={!session.isDemo}
          playerId={session.playerId}
          playerName={
            session.gameState.players.find((p) => p.id === session.playerId)?.name
          }
          gameState={session.gameState}
        >
          <WaitingRoom
            gameState={session.gameState}
            roomCode={session.roomCode || ''}
            demoHint={demoHint}
            onSetReady={(ready) => session.setReady(ready)}
            onStartGame={() => session.startGame()}
            onLeave={handleLeave}
          />
        </RoomSocialProvider>
      )}

      {session.gameState.phase === 'dealing' && (
        <RoomSocialProvider
          socket={session.isDemo ? null : session.socket ?? null}
          enabled={!session.isDemo}
          playerId={session.playerId}
          playerName={
            session.gameState.players.find((p) => p.id === session.playerId)?.name
          }
          gameState={session.gameState}
        >
          <DealingPhase
            gameState={session.gameState}
            roomCode={session.roomCode || ''}
            demoHint={demoHint}
            onStartDealing={() => session.startDealing()}
            onDistributeCards={() => session.distributeCards()}
            onLeave={handleLeave}
          />
        </RoomSocialProvider>
      )}

      {session.gameState.phase !== 'waiting' &&
        session.gameState.phase !== 'dealing' && (
          <RoomSocialProvider
            socket={session.isDemo ? null : session.socket ?? null}
            enabled={!session.isDemo}
            playerId={session.playerId}
            playerName={
              session.gameState.players.find((p) => p.id === session.playerId)?.name
            }
            gameState={session.gameState}
          >
            <GameBoard
              gameState={session.gameState}
              roomCode={session.roomCode || ''}
              demoHint={demoHint}
              onDrawDeck={() => session.drawFromDeck()}
              onPickFromDiscard={() => session.pickFromDiscard()}
              onPlaceCard={(cardIds) => session.placeCard(cardIds)}
              onShow={() => session.show()}
              onContinue={() => session.nextRound()}
              onLeave={handleLeave}
            />
          </RoomSocialProvider>
        )}
    </>
  );
}

export default App;
