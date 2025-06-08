import backendCommon from './backend/common/en';
import backendHirovo from './backend/hirovo/en';
import { uiEn } from './ui/en';

export default {
  translation: {
    ...backendCommon.translation,
    ...backendHirovo.translation,
    ...uiEn.translation
  }
};
