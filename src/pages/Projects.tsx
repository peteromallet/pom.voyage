import { Fragment, useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { HoverPopup } from '../components/HoverPopup';
import { PROJECTS, type ProjectTextPart } from '../data/assorted-content';

export function ProjectsPage() {
  const [filter, setFilter] = useState<'all' | 'ongoing'>('all');
  const [popupImage, setPopupImage] = useState<string | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const preloaders = PROJECTS.flatMap((project) =>
      project.parts
        .filter((part): part is Extract<ProjectTextPart, { type: 'hover' }> => typeof part !== 'string' && part.type === 'hover')
        .map((part) => {
          const image = new Image();
          image.src = part.image;
          return image;
        }),
    );
    return () => {
      preloaders.length = 0;
    };
  }, []);

  const renderProjectPart = (
    part: ProjectTextPart,
    index: number,
    onHover: (image: string | null, element?: HTMLElement | null) => void,
  ) => {
    if (typeof part === 'string') {
      return <Fragment key={index}>{part}</Fragment>;
    }

    if (part.type === 'link') {
      return (
        <a key={`${part.href}-${index}`} href={part.href} target="_blank" rel="noreferrer" className="project-link">
          {part.label}
        </a>
      );
    }

    return (
      <span
        key={`${part.image}-${index}`}
        className={part.plain ? 'hover-trigger-plain' : 'hover-trigger'}
        data-img={part.image}
        onMouseEnter={(event) => onHover(part.image, event.currentTarget)}
        onMouseMove={(event) => onHover(part.image, event.currentTarget)}
        onMouseLeave={() => onHover(null)}
        onTouchStart={(event) => {
          event.preventDefault();
          onHover(part.image, event.currentTarget);
        }}
      >
        {part.label}
      </span>
    );
  };

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      setCursor({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> / Projects
          </div>
        </div>
        <div className="projects-section-content mx-auto mt-8 max-w-[720px] px-4">
          <div className="mb-5 flex gap-2">
            <button
              type="button"
              className={`projects-filter-button${filter === 'all' ? ' projects-filter-button-active' : ''}`}
              data-filter="all"
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`projects-filter-button${filter === 'ongoing' ? ' projects-filter-button-active' : ''}`}
              data-filter="ongoing"
              onClick={() => setFilter('ongoing')}
            >
              Ongoing
            </button>
          </div>
          <div className="flex flex-col">
            {PROJECTS.map((project) => {
              const filteredOut = filter === 'ongoing' && !project.ongoing;
              return (
                <div
                  key={`${project.date}-${project.parts[0]}`}
                  className={`project-entry${filteredOut ? ' filtered-out' : ''}`}
                  data-ongoing={project.ongoing ? 'true' : undefined}
                >
                  <span className="project-date">{project.date}</span>
                  <span className="project-desc">
                    {project.parts.map((part, index) =>
                      renderProjectPart(part, index, (image, element) => {
                        setPopupImage(image);
                        setAnchorRect(element?.getBoundingClientRect() ?? null);
                      }),
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <HoverPopup imageSrc={popupImage} anchorRect={anchorRect} cursor={cursor} visible={Boolean(popupImage)} />
        </div>
      </div>
    </div>
  );
}
