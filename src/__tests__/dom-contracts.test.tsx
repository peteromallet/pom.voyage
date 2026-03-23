import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/Home';
import { HOME_DOM_CONTRACTS } from '../contracts/dom-contracts';

describe('home DOM contracts', () => {
  it('preserves key selectors required by the React home experience', () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );

    HOME_DOM_CONTRACTS.forEach((contract) => {
      const elements = container.querySelectorAll(contract.selector);
      if (contract.count !== undefined) {
        expect(elements.length).toBe(contract.count);
      } else {
        expect(elements.length).toBeGreaterThan(0);
      }
    });
  });
});
