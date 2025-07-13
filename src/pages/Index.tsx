
import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../components/GameEngine';
import { VoiceController } from '../components/VoiceController';
import { AudioManager } from '../components/AudioManager';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Volume2, Mic, MicOff, Play, Pause, RotateCcw } from 'lucide-react';

const Index = () => {
  const [gameState, setGameState] = useState({
    isPlaying: false,
    mode: 'practice', // 'practice' or 'adventure'
    score: 0,
    lives: 3,
    currentLevel: 1,
    isListening: false,
    gameStarted: false
  });

  const [logs, setLogs] = useState<string[]>([]);
  const gameEngineRef = useRef<any>(null);
  const voiceControllerRef = useRef<any>(null);
  const audioManagerRef = useRef<any>(null);

  useEffect(() => {
    // Initialize game components
    audioManagerRef.current = new AudioManager();
    voiceControllerRef.current = new VoiceController({
      onCommand: handleVoiceCommand,
      onListeningChange: (listening: boolean) => {
        setGameState(prev => ({ ...prev, isListening: listening }));
      }
    });
    
    gameEngineRef.current = new GameEngine({
      audioManager: audioManagerRef.current,
      voiceController: voiceControllerRef.current,
      onStateChange: handleGameStateChange,
      onLog: addLog
    });

    // Welcome message
    setTimeout(() => {
      addLog("Welcome to EchoVerse! Use voice commands or keyboard shortcuts to navigate.");
      audioManagerRef.current?.speak("Welcome to EchoVerse, an immersive audio adventure. Press Start Game or say 'start game' to begin your journey.");
    }, 1000);

    return () => {
      gameEngineRef.current?.cleanup();
      voiceControllerRef.current?.cleanup();
      audioManagerRef.current?.cleanup();
    };
  }, []);

  const handleVoiceCommand = (command: string) => {
    addLog(`Voice command: ${command}`);
    gameEngineRef.current?.processCommand(command);
  };

  const handleGameStateChange = (newState: any) => {
    setGameState(prev => ({ ...prev, ...newState }));
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const startGame = () => {
    gameEngineRef.current?.startGame(gameState.mode);
    setGameState(prev => ({ ...prev, gameStarted: true, isPlaying: true }));
  };

  const toggleMode = () => {
    const newMode = gameState.mode === 'practice' ? 'adventure' : 'practice';
    setGameState(prev => ({ ...prev, mode: newMode }));
    audioManagerRef.current?.speak(`Switched to ${newMode} mode`);
  };

  const resetGame = () => {
    gameEngineRef.current?.resetGame();
    setGameState(prev => ({ 
      ...prev, 
      gameStarted: false, 
      isPlaying: false, 
      score: 0, 
      lives: 3, 
      currentLevel: 1 
    }));
  };

  const toggleListening = () => {
    if (gameState.isListening) {
      voiceControllerRef.current?.stopListening();
    } else {
      voiceControllerRef.current?.startListening();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 font-mono">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4 text-cyan-400 tracking-wider">
          ECHOVERSE
        </h1>
        <p className="text-xl text-gray-300 mb-4">
          AI-Powered Voice-Controlled Audio Adventure
        </p>
        <div className="flex justify-center gap-4 mb-6">
          <Badge variant="outline" className="text-lg p-2 border-cyan-400 text-cyan-400">
            Mode: {gameState.mode.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-lg p-2 border-green-400 text-green-400">
            Score: {gameState.score}
          </Badge>
          <Badge variant="outline" className="text-lg p-2 border-red-400 text-red-400">
            Lives: {gameState.lives}
          </Badge>
          <Badge variant="outline" className="text-lg p-2 border-yellow-400 text-yellow-400">
            Level: {gameState.currentLevel}
          </Badge>
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Game Controls */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">Game Controls</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={startGame}
              disabled={gameState.isPlaying}
              className="h-16 text-lg bg-green-600 hover:bg-green-700 text-white"
              aria-label="Start Game (Shortcut: S)"
            >
              <Play className="mr-2" />
              Start Game
            </Button>
            
            <Button
              onClick={toggleMode}
              disabled={gameState.isPlaying}
              className="h-16 text-lg bg-blue-600 hover:bg-blue-700 text-white"
              aria-label="Toggle Mode (Shortcut: M)"
            >
              <RotateCcw className="mr-2" />
              Toggle Mode
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button
              onClick={toggleListening}
              className={`h-16 text-lg ${gameState.isListening ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
              aria-label="Toggle Voice Commands (Shortcut: V)"
            >
              {gameState.isListening ? <MicOff className="mr-2" /> : <Mic className="mr-2" />}
              {gameState.isListening ? 'Stop Listening' : 'Start Listening'}
            </Button>

            <Button
              onClick={resetGame}
              className="h-16 text-lg bg-gray-600 hover:bg-gray-700 text-white"
              aria-label="Reset Game (Shortcut: R)"
            >
              <RotateCcw className="mr-2" />
              Reset
            </Button>
          </div>

          {/* Voice Commands Help */}
          <div className="bg-gray-900 p-4 rounded-lg">
            <h3 className="text-lg font-bold mb-3 text-yellow-400">Voice Commands:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>"start game" - Begin adventure</div>
              <div>"go left" - Move left</div>
              <div>"go right" - Move right</div>
              <div>"go forward" - Move forward</div>
              <div>"go back" - Move backward</div>
              <div>"look around" - Examine area</div>
              <div>"help" - Get assistance</div>
              <div>"repeat" - Repeat last message</div>
            </div>
          </div>
        </Card>

        {/* Status & Logs */}
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">Game Status</h2>
          
          {/* Current Status */}
          <div className="mb-6 p-4 bg-gray-900 rounded-lg">
            <div className="flex items-center mb-2">
              <Volume2 className="mr-2 text-green-400" />
              <span className={`text-lg ${gameState.isListening ? 'text-green-400' : 'text-gray-400'}`}>
                {gameState.isListening ? 'Listening for commands...' : 'Voice commands inactive'}
              </span>
            </div>
            <div className="text-lg text-gray-300">
              {gameState.isPlaying ? 'Game in progress' : 'Game ready to start'}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-gray-900 p-4 rounded-lg max-h-80 overflow-y-auto">
            <h3 className="text-lg font-bold mb-3 text-yellow-400">Activity Log:</h3>
            <div className="space-y-1 text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No activity yet...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="text-gray-300 font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="max-w-6xl mx-auto mt-8">
        <Card className="bg-gray-800 border-gray-700 p-4">
          <h3 className="text-lg font-bold mb-3 text-yellow-400">Keyboard Shortcuts:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">S</kbd> Start Game</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">M</kbd> Toggle Mode</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">V</kbd> Toggle Voice</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">R</kbd> Reset Game</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">←</kbd> Move Left</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">→</kbd> Move Right</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">↑</kbd> Move Forward</div>
            <div><kbd className="bg-gray-700 px-2 py-1 rounded">↓</kbd> Move Back</div>
          </div>
        </Card>
      </div>

      {/* Hidden elements for screen readers */}
      <div className="sr-only" aria-live="polite" role="status">
        {logs[logs.length - 1]}
      </div>
    </div>
  );
};

export default Index;
