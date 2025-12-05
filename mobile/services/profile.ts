import api from './api';

export interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string | null;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  profile_image_url?: string | null;
}

export interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export const getProfile = async (): Promise<ProfileData> => {
  try {
    const response = await api.get('/profile');
    return response.data?.data?.user || response.data?.user || response.data;
  } catch (error: any) {
    console.error('Error al obtener perfil:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al cargar el perfil'
    );
  }
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<ProfileData> => {
  try {
    const response = await api.put('/profile', payload);
    return response.data?.data?.user || response.data?.user || response.data;
  } catch (error: any) {
    console.error('Error al actualizar perfil:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      for (const field in error.response.data.errors) {
        errorMessages.push(error.response.data.errors[field].join(', '));
      }
      throw new Error(errorMessages.join('; '));
    }
    
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al actualizar el perfil'
    );
  }
};

export const changePassword = async (payload: ChangePasswordPayload): Promise<void> => {
  try {
    await api.put('/profile/password', payload);
  } catch (error: any) {
    console.error('Error al cambiar contraseña:', error);
    
    if (error.response?.data?.errors) {
      const errorMessages: string[] = [];
      for (const field in error.response.data.errors) {
        errorMessages.push(error.response.data.errors[field].join(', '));
      }
      throw new Error(errorMessages.join('; '));
    }
    
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'Error al cambiar la contraseña'
    );
  }
};

