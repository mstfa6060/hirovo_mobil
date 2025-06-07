import backendCommon from './backend/common/tr.js';
import backendHirovo from './backend/hirovo/tr.js';
import { uiTr } from './ui/tr.js';

export default {
  translation: {
    ...backendCommon.translation,
    ...backendHirovo.translation,
    ...uiTr.translation
  }
};
