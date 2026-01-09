// src/context/AuthContext.tsx

import { createContext } from 'react';
import type { AuthContextType } from '../types/auth';

// export do objeto de contexto puro (vazio)
// evitando uso do context fora do provider 
export const AuthContext = createContext<AuthContextType | undefined>(undefined);