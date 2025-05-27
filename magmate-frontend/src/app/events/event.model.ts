// Modèle d'événement basé sur l'entité du backend
export enum EventType {
  EVENT = 'EVENT',
  ACTIVITY = 'ACTIVITY',
}

export enum EventStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Event {
  id: string;
  title: string;
  description: string;
  city: string;
  lieu: string;
  type: EventType;
  date: Date;
  imageUrl: string;
  status: EventStatus;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: any; // On peut ajouter plus de détails si nécessaire
}

// DTO pour la création d'un événement
export interface CreateEventDto {
  title: string;
  description: string;
  city: string;
  lieu: string;
  type: EventType;
  date: Date;
  imageUrl: string;
}

// DTO pour la mise à jour d'un événement
export interface UpdateEventDto {
  title?: string;
  description?: string;
  city?: string;
  lieu?: string;
  type?: EventType;
  date?: Date;
  imageUrl?: string;
}