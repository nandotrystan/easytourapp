import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Text, Button, TextInput, Modal } from 'react-native-paper'; // Importe Modal do Paper
import Rating from './Rating';

interface ReviewModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  type: 'tour' | 'guide';
  title: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  type,
  title
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Por favor, selecione uma avaliação');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment.trim() || undefined);
      setRating(0);
      setComment('');
      onDismiss();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setRating(0);
    setComment('');
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Avaliar {type === 'tour' ? 'Passeio' : 'Guia'}
          </Text>
          <Text style={styles.subTitle}>{title}</Text>
          
          <View style={styles.ratingSection}>
            <Text style={styles.ratingLabel}>Sua avaliação:</Text>
            <Rating rating={rating} onRate={setRating} size={32} />
            <Text style={styles.ratingValue}>
              {rating > 0 ? `${rating} estrela${rating > 1 ? 's' : ''}` : 'Selecione'}
            </Text>
          </View>

          <TextInput
            label="Comentário (opcional)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            style={styles.commentInput}
            mode="outlined"
            placeholder="Conte sua experiência..."
          />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleDismiss}
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || rating === 0}
              style={styles.submitButton}
            >
              Enviar Avaliação
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 0,
  },
  modalContent: {
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 12,
  },
  ratingValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  commentInput: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});

export default ReviewModal;