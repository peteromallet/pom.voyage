import { Header } from '../components/Header';
import { MUTE_LIST_INTRO, MUTE_LIST_NOTE } from '../data/assorted-content';

export function MuteListPage() {
  return (
    <div className="container">
      <Header activeTab="assorted" />
      <div id="sorted-section" className="content-section">
        <div className="sorted-section-content">
          <div className="sorted-breadcrumb">
            <a href="/assorted">Assorted</a> / Mute list
          </div>
          <div>
            <p className="text-[0.85rem] leading-[1.7] text-[#777]">{MUTE_LIST_INTRO}</p>
            <p className="mt-3 text-[0.8rem] italic leading-[1.7] text-[#999]">{MUTE_LIST_NOTE}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
