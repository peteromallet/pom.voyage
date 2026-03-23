import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Header } from '../Header';
import { renderWithRouter } from '../../test-utils/render';

function renderHeader(props: React.ComponentProps<typeof Header>) {
  return renderWithRouter(<Header {...props} />);
}

describe('Header', () => {
  it('renders the POM letters', () => {
    renderHeader({ activeTab: 'about' });
    expect(screen.getAllByText('P').length).toBeGreaterThan(0);
    expect(screen.getAllByText('O').length).toBeGreaterThan(0);
    expect(screen.getAllByText('M').length).toBeGreaterThan(0);
  });

  it('renders navigation tabs: About, Posts, Assorted', () => {
    renderHeader({ activeTab: 'about' });
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Posts')).toBeInTheDocument();
    expect(screen.getByText('Assorted')).toBeInTheDocument();
  });

  it('renders "About" link with active class when activeTab is "about"', () => {
    const { container } = renderHeader({ activeTab: 'about' });
    const activeLink = container.querySelector('.toggle-btn.active');
    expect(activeLink).not.toBeNull();
    expect(activeLink!.textContent).toBe('About');
  });

  it('renders "Posts" without active class when activeTab is "about"', () => {
    const { container } = renderHeader({ activeTab: 'about' });
    const links = Array.from(container.querySelectorAll('a.toggle-btn'));
    const postsLink = links.find((l) => l.textContent === 'Posts');
    expect(postsLink).not.toBeUndefined();
    expect(postsLink).not.toHaveClass('active');
  });

  it('renders "Posts" link with active class when activeTab is "posts"', () => {
    const { container } = renderHeader({ activeTab: 'posts' });
    const activeLink = container.querySelector('.toggle-btn.active');
    expect(activeLink).not.toBeNull();
    expect(activeLink!.textContent).toBe('Posts');
  });

  it('renders "Assorted" link with active class when activeTab is "assorted"', () => {
    const { container } = renderHeader({ activeTab: 'assorted' });
    const activeLink = container.querySelector('.toggle-btn.active');
    expect(activeLink).not.toBeNull();
    expect(activeLink!.textContent).toBe('Assorted');
  });

  it('each tab link points to the correct URL', () => {
    const { container } = renderHeader({ activeTab: 'about' });
    const links = container.querySelectorAll('a.toggle-btn');
    const linkMap = Object.fromEntries(
      Array.from(links).map((l) => [l.textContent!.trim(), l.getAttribute('href')]),
    );
    expect(linkMap['Posts']).toBe('/posts');
    expect(linkMap['Assorted']).toBe('/assorted');
    expect(container.querySelector('a#pom-letters')).toHaveAttribute('href', '/');
  });

  it('in homeMode, POM letters are not wrapped in a link', () => {
    const { container } = renderHeader({ activeTab: 'about', homeMode: true });
    const pomLetters = container.querySelector('#pom-letters');
    expect(pomLetters).not.toBeNull();
    expect(pomLetters!.tagName).toBe('DIV');
  });

  it('without homeMode, POM letters are wrapped in a link to "/"', () => {
    const { container } = renderHeader({ activeTab: 'posts' });
    const pomLetters = container.querySelector('#pom-letters');
    expect(pomLetters).not.toBeNull();
    expect(pomLetters!.tagName).toBe('A');
    expect(pomLetters).toHaveAttribute('href', '/');
  });

  it('shows "Peter O\'Malley" name reveal text', () => {
    renderHeader({ activeTab: 'about' });
    expect(screen.getByText("Peter O'Malley")).toBeInTheDocument();
  });
});
