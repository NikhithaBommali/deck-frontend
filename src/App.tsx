import { useEffect, useMemo } from 'react';
import { useGameSession } from './hooks/useGameSession';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { DealingPhase } from './components/DealingPhase';
import { GameBoard } from './components/GameBoard';
import { DemoHintBar } from './components/DemoHintBar';
import { getInviteCodeFromUrl } from './utils/roomInvite';

function ReconnectingScreen() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-felt-900 via-felt-800 to-felt-900 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-pulse">🃏</div>
        <h2 className="font-display text-2xl text-gold-400 font-bold">
          Reconnecting...
        </h2>
        <p className="text-white/50 text-sm max-w-xs">
          Restoring your game session. Please wait.
        </p>
      </div>
    </div>
  );
}

function App() {
  const session = useGameSession();
  const inviteCode = useMemo(() => getInviteCodeFromUrl(), []);

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

  const demoHint =
    session.isDemo && session.demoHint ? (
      <DemoHintBar hint={session.demoHint} />
    ) : null;

  if (session.reconnecting && !session.gameState) {
    return <ReconnectingScreen />;
  }

  if (!session.gameState) {
    return (
      <Lobby
        connected={session.connected}
        initialJoinCode={inviteCode}
        onCreateRoom={(name, picture) => session.createRoom(name, picture)}
        onJoinRoom={(code, name, picture) => session.joinRoom(code, name, picture)}
        onPeekRoom={(code) => session.peekRoom(code)}
        onStartDemo={() => session.startDemo()}
        error={session.error}
      />
    );
  }

  if (session.gameState.phase === 'waiting') {
    return (
      <>
        <WaitingRoom
          gameState={session.gameState}
          roomCode={session.roomCode || ''}
          onSetReady={(ready) => session.setReady(ready)}
          onStartGame={() => session.startGame()}
          onLeave={handleLeave}
        />
        {demoHint}
      </>
    );
  }

  if (session.gameState.phase === 'dealing') {
    return (
      <>
        <DealingPhase
          gameState={session.gameState}
          roomCode={session.roomCode || ''}
          onStartDealing={() => session.startDealing()}
          onDistributeCards={() => session.distributeCards()}
          onLeave={handleLeave}
        />
        {demoHint}
      </>
    );
  }

  return (
    <>
      <GameBoard
        gameState={session.gameState}
        roomCode={session.roomCode || ''}
        onDrawDeck={() => session.drawFromDeck()}
        onPickFromDiscard={() => session.pickFromDiscard()}
        onPlaceCard={(cardIds) => session.placeCard(cardIds)}
        onShow={() => session.show()}
        onContinue={() => session.nextRound()}
        onLeave={handleLeave}
      />
      {demoHint}
    </>
  );
}

export default App;
