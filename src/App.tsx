import { useMemo } from 'react';
import { useSocket } from './hooks/useSocket';
import { Lobby } from './components/Lobby';
import { WaitingRoom } from './components/WaitingRoom';
import { DealingPhase } from './components/DealingPhase';
import { GameBoard } from './components/GameBoard';
import { getInviteCodeFromUrl } from './utils/roomInvite';

function ReconnectingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-felt-900 via-felt-800 to-felt-900 flex items-center justify-center p-4">
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
  const socket = useSocket();
  const inviteCode = useMemo(() => getInviteCodeFromUrl(), []);

  const handleLeave = async () => {
    const confirmed = window.confirm(
      'Leave this game? You will forfeit your seat and others can continue without you.'
    );
    if (confirmed) {
      await socket.leaveRoom();
    }
  };

  if (socket.reconnecting && !socket.gameState) {
    return <ReconnectingScreen />;
  }

  if (!socket.gameState) {
    return (
      <Lobby
        connected={socket.connected}
        initialJoinCode={inviteCode}
        onCreateRoom={(name, picture) => socket.createRoom(name, picture)}
        onJoinRoom={(code, name, picture) => socket.joinRoom(code, name, picture)}
        onPeekRoom={(code) => socket.peekRoom(code)}
        error={socket.error}
      />
    );
  }

  if (socket.gameState.phase === 'waiting') {
    return (
      <WaitingRoom
        gameState={socket.gameState}
        roomCode={socket.roomCode || ''}
        onSetReady={(ready) => socket.setReady(ready)}
        onStartGame={() => socket.startGame()}
        onLeave={handleLeave}
      />
    );
  }

  if (socket.gameState.phase === 'dealing') {
    return (
      <DealingPhase
        gameState={socket.gameState}
        roomCode={socket.roomCode || ''}
        onStartDealing={() => socket.startDealing()}
        onDistributeCards={() => socket.distributeCards()}
        onLeave={handleLeave}
      />
    );
  }

  return (
    <GameBoard
      gameState={socket.gameState}
      roomCode={socket.roomCode || ''}
      onDrawDeck={() => socket.drawFromDeck()}
      onPickFromDiscard={() => socket.pickFromDiscard()}
      onPlaceCard={(cardIds) => socket.placeCard(cardIds)}
      onShow={() => socket.show()}
      onContinue={() => socket.nextRound()}
      onLeave={handleLeave}
    />
  );
}

export default App;
