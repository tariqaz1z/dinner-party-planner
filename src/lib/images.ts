import tomatoSoupLoaf from '../assets/illustrations/tomato-soup-loaf.png';
import pestoPasta from '../assets/illustrations/pesto-pasta.png';
import harissaChicken from '../assets/illustrations/harissa-chicken.png';
import mushroomRisotto from '../assets/illustrations/mushroom-risotto.png';
import shrimpTacos from '../assets/illustrations/shrimp-tacos.png';
import peanutNoodles from '../assets/illustrations/peanut-noodles.png';
import appleGalette from '../assets/illustrations/apple-galette.png';
import halloumiTabbouleh from '../assets/illustrations/halloumi-tabbouleh.png';
import riceBowl from '../assets/illustrations/rice-bowl.png';
import bread from '../assets/illustrations/bread.png';
import wine from '../assets/illustrations/wine.png';
import candle from '../assets/illustrations/candle.png';
import avatarMe from '../assets/illustrations/avatar-me.png';
import avatarPriya from '../assets/illustrations/avatar-priya.png';
import avatarJordan from '../assets/illustrations/avatar-jordan.png';
import avatarMaya from '../assets/illustrations/avatar-maya.png';
import avatarSam from '../assets/illustrations/avatar-sam.png';
import avatarDevon from '../assets/illustrations/avatar-devon.png';
import avatarAlex from '../assets/illustrations/avatar-alex.png';
import avatarRiley from '../assets/illustrations/avatar-riley.png';
import avatarGuest from '../assets/illustrations/avatar-guest.png';

export const foodImages = {
  'tomato-soup-loaf': tomatoSoupLoaf,
  'pesto-pasta': pestoPasta,
  'harissa-chicken': harissaChicken,
  'mushroom-risotto': mushroomRisotto,
  'shrimp-tacos': shrimpTacos,
  'peanut-noodles': peanutNoodles,
  'apple-galette': appleGalette,
  'halloumi-tabbouleh': halloumiTabbouleh,
  'rice-bowl': riceBowl,
  'bread': bread,
  'wine': wine,
  'candle': candle,
};

// Resolve by stable ID so existing localStorage profiles get artwork too.
export const avatarImages: Record<string, string> = {
  'me': avatarMe,
  'priya': avatarPriya,
  'jordan': avatarJordan,
  'maya': avatarMaya,
  'sam': avatarSam,
  'devon': avatarDevon,
  'alex': avatarAlex,
  'riley': avatarRiley,
  'guest': avatarGuest,
};
