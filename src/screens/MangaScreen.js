import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, Linking } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useNavigation } from '@react-navigation/native';

const mangaData = {
  '1-1': {
    horizontal: [
      require('../../assets/mangas/Trilha I/N1/Cena1_N1T1.jpg'),
      require('../../assets/mangas/Trilha I/N1/Cena2_N1T1.jpg'),
      require('../../assets/mangas/Trilha I/N1/Cena3_N1T1.jpg'),
      require('../../assets/mangas/Trilha I/N1/Cena4_N1T1.jpg'),
      require('../../assets/mangas/Trilha I/N1/Cena5_N1T1.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha I/N1/N1T1.jpg'),
  },
  '1-2': {
    horizontal: [
      require('../../assets/mangas/Trilha I/N2/Cena1_N2T1.jpg'),
      require('../../assets/mangas/Trilha I/N2/Cena2_N2T1.jpg'),
      require('../../assets/mangas/Trilha I/N2/Cena3_N2T1.jpg'),
      require('../../assets/mangas/Trilha I/N2/Cena4_N2T1.jpg'),
      require('../../assets/mangas/Trilha I/N2/Cena5_N2T1.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha I/N2/N2T1.jpg'),
  },
  '1-3': {
    horizontal: [
      require('../../assets/mangas/Trilha I/N3/Cena1_N3T1.jpg'),
      require('../../assets/mangas/Trilha I/N3/Cena2_N3T1.jpg'),
      require('../../assets/mangas/Trilha I/N3/Cena3_N3T1.jpg'),
      require('../../assets/mangas/Trilha I/N3/Cena4_N3T1.jpg'),
      require('../../assets/mangas/Trilha I/N3/Cena5_N3T1.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha I/N3/N3T1.jpg'),
  },
  '1-4': {
    horizontal: [
      require('../../assets/mangas/Trilha I/N4/Cena1_N4T1.jpg'),
      require('../../assets/mangas/Trilha I/N4/Cena2_N4T1.jpg'),
      require('../../assets/mangas/Trilha I/N4/Cena3_N4T1.jpg'),
      require('../../assets/mangas/Trilha I/N4/Cena4_N4T1.jpg'),
      require('../../assets/mangas/Trilha I/N4/Cena5_N4T1.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha I/N4/N4T1.jpg'),
  },
  '1-5': {
    horizontal: [
      require('../../assets/mangas/Trilha I/N5/Cena1_N5T1.jpg'),
      require('../../assets/mangas/Trilha I/N5/Cena2_N5T1.jpg'),
      require('../../assets/mangas/Trilha I/N5/Cena3_N5T1.jpg'),
      require('../../assets/mangas/Trilha I/N5/Cena4_N5T1.jpg'),
      require('../../assets/mangas/Trilha I/N5/Cena5_N5T1.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha I/N5/N5T1.jpg'),
  },
  '2-1': {
    horizontal: [
      require('../../assets/mangas/Trilha II/N1/Cena1_N1T2.jpg'),
      require('../../assets/mangas/Trilha II/N1/Cena2_N1T2.jpg'),
      require('../../assets/mangas/Trilha II/N1/Cena3_N1T2.jpg'),
      require('../../assets/mangas/Trilha II/N1/Cena4_N1T2.jpg'),
      require('../../assets/mangas/Trilha II/N1/Cena5_N1T2.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha II/N1/N1T2.jpg'),
  },
  '2-2': {
    horizontal: [
      require('../../assets/mangas/Trilha II/N2/Cena1_N2T2.jpg'),
      require('../../assets/mangas/Trilha II/N2/Cena2_N2T2.jpg'),
      require('../../assets/mangas/Trilha II/N2/Cena3_N2T2.jpg'),
      require('../../assets/mangas/Trilha II/N2/Cena4_N2T2.jpg'),
      require('../../assets/mangas/Trilha II/N2/Cena5_N2T2.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha II/N2/N2T2.jpg'),
  },
  '2-3': {
    horizontal: [
      require('../../assets/mangas/Trilha II/N3/Cena1_N3T2.jpg'),
      require('../../assets/mangas/Trilha II/N3/Cena2_N3T2.jpg'),
      require('../../assets/mangas/Trilha II/N3/Cena3_N3T2.jpg'),
      require('../../assets/mangas/Trilha II/N3/Cena4_N3T2.jpg'),
      require('../../assets/mangas/Trilha II/N3/Cena5_N3T2.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha II/N3/N3T2.jpg'),
  },
  '2-4': {
    horizontal: [
      require('../../assets/mangas/Trilha II/N4/Cena1_N4T2.jpg'),
      require('../../assets/mangas/Trilha II/N4/Cena2_N4T2.jpg'),
      require('../../assets/mangas/Trilha II/N4/Cena3_N4T2.jpg'),
      require('../../assets/mangas/Trilha II/N4/Cena4_N4T2.jpg'),
      require('../../assets/mangas/Trilha II/N4/Cena5_N4T2.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha II/N4/N4T2.jpg'),
  },
  '2-5': {
    horizontal: [
      require('../../assets/mangas/Trilha II/N5/Cena1_N5T2.jpg'),
      require('../../assets/mangas/Trilha II/N5/Cena2_N5T2.jpg'),
      require('../../assets/mangas/Trilha II/N5/Cena3_N5T2.jpg'),
      require('../../assets/mangas/Trilha II/N5/Cena4_N5T2.jpg'),
      require('../../assets/mangas/Trilha II/N5/Cena5_N5T2.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha II/N5/N5T2.jpg'),
  },
  '3-1': {
    horizontal: [
      require('../../assets/mangas/Trilha III/N1/Cena1_N1T3.jpg'),
      require('../../assets/mangas/Trilha III/N1/Cena2_N1T3.jpg'),
      require('../../assets/mangas/Trilha III/N1/Cena3_N1T3.jpg'),
      require('../../assets/mangas/Trilha III/N1/Cena4_N1T3.jpg'),
      require('../../assets/mangas/Trilha III/N1/Cena5_N1T3.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha III/N1/N1T3.jpg'),
  },
  '3-2': {
    horizontal: [
      require('../../assets/mangas/Trilha III/N2/Cena1_N2T3.jpg'),
      require('../../assets/mangas/Trilha III/N2/Cena2_N2T3.jpg'),
      require('../../assets/mangas/Trilha III/N2/Cena3_N2T3.jpg'),
      require('../../assets/mangas/Trilha III/N2/Cena4_N2T3.jpg'),
      require('../../assets/mangas/Trilha III/N2/Cena5_N2T3.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha III/N2/N2T3.jpg'),
  },
  '3-3': {
    horizontal: [
      require('../../assets/mangas/Trilha III/N3/Cena1_N3T3.jpg'),
      require('../../assets/mangas/Trilha III/N3/Cena2_N3T3.jpg'),
      require('../../assets/mangas/Trilha III/N3/Cena3_N3T3.jpg'),
      require('../../assets/mangas/Trilha III/N3/Cena4_N3T3.jpg'),
      require('../../assets/mangas/Trilha III/N3/Cena5_N3T3.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha III/N3/N3T3.jpg'),
  },
  '3-4': {
    horizontal: [
      require('../../assets/mangas/Trilha III/N4/Cena1_N4T3.jpg'),
      require('../../assets/mangas/Trilha III/N4/Cena2_N4T3.jpg'),
      require('../../assets/mangas/Trilha III/N4/Cena3_N4T3.jpg'),
      require('../../assets/mangas/Trilha III/N4/Cena4_N4T3.jpg'),
      require('../../assets/mangas/Trilha III/N4/Cena5_N4T3.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha III/N4/N4T3.jpg'),
  },
  '3-5': {
    horizontal: [
      require('../../assets/mangas/Trilha III/N5/Cena1_N5T3.jpg'),
      require('../../assets/mangas/Trilha III/N5/Cena2_N5T3.jpg'),
      require('../../assets/mangas/Trilha III/N5/Cena3_N5T3.jpg'),
      require('../../assets/mangas/Trilha III/N5/Cena4_N5T3.jpg'),
      require('../../assets/mangas/Trilha III/N5/Cena5_N5T3.jpg'),
    ],
    vertical: require('../../assets/mangas/Trilha III/N5/N5T3.jpg'),
  },
};

const MangaScreen = ({ route }) => {
  const { trailNumber, levelNumber, fromMangaLibrary } = route.params; // Identificar se veio da Mangáteca
  const [orientation, setOrientation] = useState(null);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [mangaFadeAnim] = useState(new Animated.Value(0));
  const [showManga, setShowManga] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [linksVisible, setLinksVisible] = useState(false);
  const [linksHeight] = useState(new Animated.Value(0));
  const [buttonPosition] = useState(new Animated.Value(1));
  const navigation = useNavigation();

  const getMangaImages = () => {
    const key = `${trailNumber}-${levelNumber}`;
    return mangaData[key] || mangaData['1-1'];
  };

  const { horizontal: images, vertical: verticalImage } = getMangaImages();

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setWindowDimensions({ width, height });
    };

    const setInitialOrientation = async () => {
      const orientationInfo = await ScreenOrientation.getOrientationAsync();
      setOrientation(orientationInfo);
      updateDimensions();
    };

    const subscribe = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
      setOrientation(orientationInfo.orientation);
      updateDimensions();
    });

    const dimensionChange = Dimensions.addEventListener('change', updateDimensions);

    setInitialOrientation();

    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowMessage(false);
      setShowManga(true);
      Animated.timing(mangaFadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscribe);
      dimensionChange?.remove();
    };
  }, []);

  const toggleLinksVisibility = () => {
    if (linksVisible) {
      Animated.parallel([
        Animated.timing(linksHeight, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(buttonPosition, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start(() => setLinksVisible(false));
    } else {
      setLinksVisible(true);
      Animated.parallel([
        Animated.timing(linksHeight, {
          toValue: 300,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(buttonPosition, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      const newIndex = currentIndex + 1;
      scrollViewRef.current.scrollTo({ x: newIndex * windowDimensions.width * 0.8, animated: true });
      setCurrentIndex(newIndex);
    } else {
      navigation.navigate('QuestionScreen', { trailNumber, levelNumber });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      scrollViewRef.current.scrollTo({ x: newIndex * windowDimensions.width * 0.8, animated: true });
      setCurrentIndex(newIndex);
    }
  };

  const renderLinks = () => (
    <Animated.View style={[styles.linksContainer, { height: linksHeight }]}>
      <Text style={styles.linksHeader}>Explore mais sobre este conteúdo:</Text>
      <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://example.com')}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="library-books" size={24} color="#fff" />
        </View>
        <Text style={styles.linkText}>Leitura Complementar</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://example.com')}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="play-circle-filled" size={24} color="#fff" />
        </View>
        <Text style={styles.linkText}>Vídeos Relacionados</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkItem} onPress={() => Linking.openURL('https://example.com')}>
        <View style={styles.iconContainer}>
          <MaterialIcons name="description" size={24} color="#fff" />
        </View>
        <Text style={styles.linkText}>Resumos e Dicas</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderHorizontalImages = () => (
    <>
      <Animated.View style={{ opacity: mangaFadeAnim, flex: 1, flexDirection: 'row', alignItems: 'center' }}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.leftArrow} onPress={handlePrev}>
            <Text style={styles.arrowText}>{"<"}</Text>
          </TouchableOpacity>
        )}
        <ScrollView
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={windowDimensions.width * 0.8}
          decelerationRate="fast"
          style={[styles.scrollView, { width: windowDimensions.width * 0.8 }]}
          ref={scrollViewRef}
          scrollEnabled={false}
        >
          {images.map((image, index) => (
            <View key={index} style={{ width: windowDimensions.width * 0.8 }}>
              <Image
                source={image}
                style={[
                  styles.mangaImage,
                  { width: windowDimensions.width * 0.8, height: windowDimensions.height * 1.1 },
                ]}
              />
            </View>
          ))}
        </ScrollView>
        {/* A seta da direita só é exibida se não vier do fluxo da Mangáteca */}
        {!fromMangaLibrary && currentIndex < images.length - 1 && (
          <TouchableOpacity style={styles.rightArrow} onPress={handleNext}>
            <Text style={styles.arrowText}>{">"}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
      {renderLinks()}
    </>
  );

  const renderVerticalContent = () => (
    <>
      <Animated.Image
        source={verticalImage}
        style={[
          styles.mangaImageVertical,
          { opacity: mangaFadeAnim, height: windowDimensions.height * 0.7 },
        ]}
        resizeMode="contain"
      />
      {/* A seta direita vertical só aparece se não for chamada da Mangateca */}
      {!fromMangaLibrary && (
        <TouchableOpacity
          style={styles.rightArrowVertical}
          onPress={() => navigation.navigate('QuestionScreen', { trailNumber, levelNumber })}
        >
          <Text style={styles.arrowText}>{">"}</Text>
        </TouchableOpacity>
      )}
      {renderLinks()}
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {showMessage && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.warningText}>Para uma melhor experiência, use o celular na horizontal durante a leitura.</Text>
            <Image
              source={require('../../assets/gifs/rotate-phone.gif')}
              style={styles.rotateGif}
            />
          </Animated.View>
        )}
        {showManga && (
          <>
            {orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
            orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
              ? renderHorizontalImages()
              : renderVerticalContent()}
            <Animated.View
              style={[
                styles.expandButton,
                {
                  bottom: buttonPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [275, 0],
                  }),
                },
              ]}
            >
              <TouchableOpacity onPress={toggleLinksVisibility}>
                <MaterialIcons name={linksVisible ? "expand-less" : "expand-more"} size={24} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  warningText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  rotateGif: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  mangaImage: {
    resizeMode: 'contain',
  },
  mangaImageVertical: {
    width: '100%',
    marginTop: 30,
    flex: 1,
  },
  leftArrow: {
    marginRight: 10,
    padding: 15,
    borderRadius: 20,
    zIndex: 1,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  rightArrow: {
    marginLeft: 10,
    padding: 15,
    borderRadius: 20,
    zIndex: 1,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  rightArrowVertical: {
    position: 'absolute',
    alignSelf: 'flex-end',
    top: '50%',
    transform: [{ translateY: -25 }],
    padding: 15,
    borderRadius: 20,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  arrowText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  expandButton: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 2,
  },
  linksContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#1c1c1c',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderTopWidth: 1,
    borderTopColor: '#444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  linksHeader: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#2a2a2a',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 5,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 15,
  },
  iconContainer: {
    backgroundColor: '#444',
    padding: 8,
    borderRadius: 50,
  },
});

export default MangaScreen;
