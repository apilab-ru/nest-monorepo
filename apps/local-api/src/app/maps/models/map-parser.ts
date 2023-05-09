import { MapDifficultDetail, RavMapDifficultDetail, RavMapDifficultDetailV2, RavMapDifficultDetailV3 } from './map';

function mapParser(inline: string): RavMapDifficultDetail {
  return JSON.parse(inline) as RavMapDifficultDetail;
}

export function readMapDifficultDetail(inline: string): MapDifficultDetail {
  const data = mapParser(inline);

  if (isV2(data)) {
    const notes = data._notes;
    const times = notes.length ? notes[notes.length - 1]._time : 0;

    return {
      notesTotal: notes.length,
      times
    };
  }

  if (isV3(data)) {
    const notes = data.colorNotes;
    const times = notes.length ? notes[notes.length - 1].b : 0;

    return {
      notesTotal: notes.length,
      times
    };
  }

  throw new Error('not found type');
}

function isV2(detail: RavMapDifficultDetail): detail is RavMapDifficultDetailV2 {
  const version = (detail as RavMapDifficultDetailV2)._version;
  return version && version[0] === '2' || !!(detail as RavMapDifficultDetailV2)._notes;
}

function isV3(detail: RavMapDifficultDetail): detail is RavMapDifficultDetailV3 {
  const version = (detail as RavMapDifficultDetailV3).version;
  return version && version[0] === '3';
}
