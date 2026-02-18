import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated,
  Modal,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// TypeScript interface for our Card data
interface CardData {
  id: number;
  question: string;
  image: string;
  type: 'swipe' | 'choice';
  correctAnswer: boolean | string;
  options?: string[];
  explanation?: string;
}

const DriveSwipePro = () => {
  // --- STATE MANAGEMENT ---
  const [mode, setMode] = useState<'practice' | 'game'>('practice');
  const [cardIndex, setCardIndex] = useState(0);
  const [timer, setTimer] = useState(5);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);

  // Animation values
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Mock Data
  const cardDeck: CardData[] = [
    {
      id: 1,
      question: 'Is it legal to perform a U-turn here?',
      image: '↩️ 🚫',
      type: 'swipe',
      correctAnswer: false,
      explanation: 'U-turns are prohibited in this area due to traffic regulations.',
    },
    {
      id: 2,
      question: 'What does this flashing yellow light mean?',
      image: '⚠️',
      type: 'choice',
      options: ['Stop', 'Yield', 'Speed Up', 'Pedestrians Only'],
      correctAnswer: 'Yield',
      explanation: 'A flashing yellow light means yield to oncoming traffic.',
    },
    {
      id: 3,
      question: 'Is it safe to park here?',
      image: '🚗 ❌',
      type: 'swipe',
      correctAnswer: false,
      explanation: 'Parking is not allowed in this designated area.',
    },
    {
      id: 4,
      question: 'What is the speed limit?',
      image: '⏱️',
      type: 'choice',
      options: ['25 mph', '35 mph', '55 mph', '65 mph'],
      correctAnswer: '35 mph',
      explanation: 'The speed limit in residential areas is typically 35 mph.',
    },
  ];

  const activeCard = cardDeck[cardIndex];

  // Pan responder for swipe detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, { dx, dy }) => {
        pan.x.setValue(dx);
        pan.y.setValue(dy);
        const rotation = (dx / width) * 360;
        rotate.setValue(rotation);
        const scaleValue = 1 - Math.abs(dx) / (width * 2);
        scale.setValue(Math.max(scaleValue, 0.9));
      },
      onPanResponderRelease: (evt, { dx, dy, vx, vy }) => {
        const threshold = width * 0.3;
        const isSwipeOut = Math.abs(dx) > threshold || Math.abs(vx) > 0.5;

        if (isSwipeOut && activeCard.type === 'swipe') {
          const swipedRight = dx > 0;
          const userAnswer = swipedRight;
          const correct = userAnswer === activeCard.correctAnswer;
          handleSwipeAnswer(correct, userAnswer);

          Animated.timing(pan, {
            toValue: { x: swipedRight ? width : -width, y: dy },
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            resetCardPosition();
            nextCard();
          });
        } else {
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              useNativeDriver: false,
            }),
            Animated.spring(scale, {
              toValue: 1,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const resetCardPosition = () => {
    pan.x.setValue(0);
    pan.y.setValue(0);
    rotate.setValue(0);
    scale.setValue(1);
  };

  const handleSwipeAnswer = (correct: boolean, answer: boolean) => {
    setIsCorrect(correct);
    setSelectedAnswer(answer);
    if (!correct) {
      setShowAnswerModal(true);
    }
  };

  const handleChoiceAnswer = (selectedOption: string) => {
    const correct = selectedOption === activeCard.correctAnswer;
    setIsCorrect(correct);
    setSelectedAnswer(selectedOption);
    if (!correct) {
      setShowAnswerModal(true);
    } else {
      setTimeout(nextCard, 300);
    }
  };

  const nextCard = () => {
    setCardIndex((prev) => (prev + 1) % cardDeck.length);
    setSelectedAnswer(null);
    resetCardPosition();
  };

  // Simple countdown effect for Game Mode
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mode === 'game' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mode, timer]);

  const resetDemo = () => {
    setTimer(5);
    setCardIndex((prev) => (prev + 1) % cardDeck.length);
  };

  // Animated transform styles
  const cardAnimatedStyle = {
    transform: [
      {
        translateX: pan.x,
      },
      {
        translateY: pan.y,
      },
      {
        rotate: rotate.interpolate({
          inputRange: [-360, 0, 360],
          outputRange: ['-360deg', '0deg', '360deg'],
        }),
      },
      {
        scale: scale,
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* --- DEV CONTROLS --- */}
      <View style={styles.devControls}>
        <Text style={styles.devText}>{mode.toUpperCase()} Mode</Text>
        <TouchableOpacity onPress={() => setMode(mode === 'practice' ? 'game' : 'practice')}>
          <Text style={styles.devButton}>Toggle</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={resetDemo}>
          <Text style={styles.devButton}>Next Card</Text>
        </TouchableOpacity>
      </View>

      {/* --- HEADER --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>DriveSwipe</Text>
          <Text style={styles.subtitle}>
            {cardIndex + 1} / {cardDeck.length}
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((cardIndex + 1) / cardDeck.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* --- MAIN INTERFACE --- */}
      <View style={styles.cardArea}>
        {/* Background stack effect */}
        <View style={styles.stackCard} />
        <View style={styles.stackCard} />

        {/* === THE CARD === */}
        <Animated.View
          style={[styles.card, cardAnimatedStyle, { zIndex: 3 }]}
          {...panResponder.panHandlers}
        >
          {/* THE HUD TIMER (Only visible in Game Mode) */}
          {mode === 'game' && (
            <View style={styles.timerContainer}>
              <Text style={[styles.timerText, timer < 3 ? styles.timerUrgent : null]}>
                {String(Math.floor(timer / 60)).padStart(1, '0')}:
                {String(timer % 60).padStart(2, '0')}
              </Text>
            </View>
          )}

          {/* Visual Scenario */}
          <View style={styles.visualContainer}>
            <Text style={styles.emojiImage}>{activeCard.image}</Text>
          </View>

          {/* Question Text */}
          <View style={styles.questionContainer}>
            <Text style={styles.questionText}>{activeCard.question}</Text>
          </View>

          {/* === MULTIPLE CHOICE OVERLAY (If Type is 'Choice') === */}
          {activeCard.type === 'choice' && activeCard.options && (
            <View style={styles.choiceGrid}>
              {activeCard.options.map((opt, i) => {
                const isSelected = selectedAnswer === opt;
                const isCorrectAnswer = activeCard.correctAnswer === opt;
                let buttonStyle = styles.choiceBtn;
                let textStyle = styles.choiceText;

                if (isSelected) {
                  if (isCorrect) {
                    buttonStyle = [styles.choiceBtn, styles.choiceBtnCorrect];
                    textStyle = [styles.choiceText, styles.choiceTextLight];
                  } else {
                    buttonStyle = [styles.choiceBtn, styles.choiceBtnIncorrect];
                    textStyle = [styles.choiceText, styles.choiceTextLight];
                  }
                } else if (selectedAnswer && isCorrectAnswer) {
                  buttonStyle = [styles.choiceBtn, styles.choiceBtnHint];
                  textStyle = [styles.choiceText, styles.choiceTextLight];
                }

                return (
                  <TouchableOpacity
                    key={i}
                    style={buttonStyle}
                    onPress={() => !selectedAnswer && handleChoiceAnswer(opt)}
                    disabled={selectedAnswer !== null}
                  >
                    <Text style={textStyle}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Animated.View>

        {/* === CONTROLS (Only Visible for Swipe Cards) === */}
        {activeCard.type === 'swipe' && (
          <View style={styles.controlsContainer}>
            <View style={styles.controlHint}>
              <Feather name="arrow-left" size={20} color="#ff6b6b" />
              <Text style={styles.controlHintText}>Unsafe</Text>
            </View>
            <View style={styles.controlHint}>
              <Text style={styles.controlHintText}>Safe</Text>
              <Feather name="arrow-right" size={20} color="#51cf66" />
            </View>
          </View>
        )}
      </View>

      {/* === ANSWER FEEDBACK MODAL === */}
      <Modal transparent visible={showAnswerModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </Text>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.answerIndicator,
                  isCorrect ? styles.correctIndicator : styles.incorrectIndicator,
                ]}
              >
                <Text style={styles.answerLabel}>
                  {isCorrect ? 'Your Answer' : 'Correct Answer'}
                </Text>
                <Text style={styles.answerValue}>
                  {activeCard.type === 'swipe'
                    ? selectedAnswer === true
                      ? 'Safe (Right)'
                      : 'Unsafe (Left)'
                    : selectedAnswer}
                </Text>
              </View>

              {!isCorrect && (
                <View style={styles.correctAnswerBox}>
                  <Text style={styles.answerLabel}>Correct Answer</Text>
                  <Text style={styles.answerValue}>
                    {activeCard.type === 'swipe'
                      ? activeCard.correctAnswer === true
                        ? 'Safe (Right)'
                        : 'Unsafe (Left)'
                      : activeCard.correctAnswer}
                  </Text>
                </View>
              )}

              {activeCard.explanation && (
                <View style={styles.explanationBox}>
                  <Text style={styles.explanationTitle}>Why?</Text>
                  <Text style={styles.explanationText}>{activeCard.explanation}</Text>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowAnswerModal(false);
                nextCard();
              }}
            >
              <Text style={styles.modalButtonText}>Next Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: 50,
  },

  // Dev Controls
  devControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#ffe0e0',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcccc',
  },
  devText: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
  },
  devButton: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 12,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#51cf66',
    borderRadius: 3,
  },

  cardArea: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // Stack effect
  stackCard: {
    position: 'absolute',
    width: width - 40,
    height: 480,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },

  // Card Styles
  card: {
    width: width - 40,
    height: 480,
    backgroundColor: 'white',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
    zIndex: 10,
  },

  // TIMER STYLES
  timerContainer: {
    position: 'absolute',
    top: 15,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  timerText: {
    color: '#51cf66',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  timerUrgent: {
    color: '#ff6b6b',
  },

  visualContainer: {
    flex: 2,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiImage: {
    fontSize: 80,
  },

  questionContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
    lineHeight: 24,
  },

  // Choice Grid Styles
  choiceGrid: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '45%',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  choiceBtn: {
    width: '48%',
    height: '45%',
    margin: '1%',
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  choiceBtnCorrect: {
    backgroundColor: '#e8f5e9',
    borderColor: '#51cf66',
  },
  choiceBtnIncorrect: {
    backgroundColor: '#ffebee',
    borderColor: '#ff6b6b',
  },
  choiceBtnHint: {
    backgroundColor: '#e8f5e9',
    borderColor: '#51cf66',
    opacity: 0.6,
  },
  choiceText: {
    fontWeight: '600',
    color: '#2d3436',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  choiceTextLight: {
    color: '#fff',
  },

  // Controls
  controlsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  controlHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    opacity: 0.7,
  },
  controlHintText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#666',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width - 40,
    maxHeight: height * 0.75,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1a1a1a',
  },
  modalBody: {
    marginBottom: 20,
  },
  answerIndicator: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  correctIndicator: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#51cf66',
  },
  incorrectIndicator: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  answerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answerValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  correctAnswerBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#51cf66',
    marginBottom: 12,
  },
  explanationBox: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#51cf66',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});