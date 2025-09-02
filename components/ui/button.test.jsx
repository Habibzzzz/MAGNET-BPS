import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from './button';

test('render button text', () => {
  render(<Button>Save</Button>);
  expect(screen.getByText('Save')).toBeInTheDocument();
});


