import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

interface RatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  starColor?: string;
}

const Rating: React.FC<RatingProps> = ({ 
  rating, 
  onRate, 
  size = 24, 
  readonly = false,
  starColor = "#FFD700"
}) => {
  const renderStars = () => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      const starRating = i <= rating ? 1 : rating - i + 1 > 0 ? rating - i + 1 : 0;
      
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => !readonly && onRate?.(i)}
          disabled={readonly}
          style={{ position: 'relative' }}
        >
          {/* Estrela vazia (fundo) */}
          <IconButton
            icon="star-outline"
            iconColor="#ccc"
            size={size}
            disabled={readonly}
            style={{ position: 'absolute' }}
          />
          {/* Estrela preenchida parcialmente */}
          {starRating > 0 && (
            <View style={{ 
              position: 'absolute', 
              width: `${starRating * 100}%`, 
              overflow: 'hidden' 
            }}>
              <IconButton
                icon="star"
                iconColor={starColor}
                size={size}
                disabled={readonly}
              />
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    return stars;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {renderStars()}
    </View>
  );
};

export default Rating;