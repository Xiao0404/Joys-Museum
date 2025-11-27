import React from 'react';

export interface Game {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}