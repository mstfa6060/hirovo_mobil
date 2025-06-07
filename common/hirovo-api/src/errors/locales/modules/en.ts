import backendCommon from './backend/common/en.js';
import backendHirovo from './backend/hirovo/en.js';
import { uiEn } from './ui/en.js';

export default {
  translation: {
    ...backendCommon.translation,
    ...backendHirovo.translation,
    ...uiEn.translation
  }
};
