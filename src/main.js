import './styles.css';
import { browserStorage, createStore } from './state.js';
import { initUI } from './ui.js';

initUI(createStore(browserStorage));
