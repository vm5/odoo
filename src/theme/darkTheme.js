import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FF6B35', // Fiery orange
      light: '#FF8B60',
      dark: '#CC4A1B',
    },
    secondary: {
      main: '#FFD700', // Golden yellow
      light: '#FFE44D',
      dark: '#B39700',
    },
    background: {
      default: '#1A1A1A', // Very dark gray
      paper: '#2D2D2D', // Slightly lighter dark gray
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#FF3D00', // Bright red-orange
    },
    warning: {
      main: '#FFA726', // Orange
    },
    info: {
      main: '#29B6F6', // Light blue
    },
    success: {
      main: '#66BB6A', // Green
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(145deg, #2D2D2D 0%, #1A1A1A 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 107, 53, 0.1)', // Subtle fiery border
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF8B60 30%, #FFE44D 90%)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorPrimary': {
            background: 'linear-gradient(45deg, #FF6B35 30%, #FF8B60 90%)',
          },
          '&.MuiChip-colorSecondary': {
            background: 'linear-gradient(45deg, #FFD700 30%, #FFE44D 90%)',
          },
        },
      },
    },
  },
});

export default darkTheme; 