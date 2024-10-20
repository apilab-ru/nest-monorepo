import { LocalMap } from '@bsab/api/map/map';

export interface MapCache extends LocalMap {
  // rav: MapRav;
}

export interface MapRav {
  _version: string; // 2.0.0
  _songName: string;
  _songSubName: string;
  _songAuthorName: string;
  _levelAuthorName: string;
  _beatsPerMinute: number;
  _shuffle: number;
  _shufflePeriod: number;
  _previewStartTime: number;
  _previewDuration: number;
  _songFilename: string;
  _coverImageFilename: string;
  _environmentName: string;
  _allDirectionsEnvironmentName: string;
  _songTimeOffset: number;
  _customData: {
    _contributors: [
      {
        _role: string;
        _name: string;
        _iconPath: string;
      },
      {
        _role: string;
        _name: string;
        _iconPath: string;
      },
    ];
    _editors: {
      _lastEditedBy: string;
      MMA2: {
        version: string;
      };
      ChroMapper: {
        version: string;
      };
    };
  };
  _difficultyBeatmapSets: [
    {
      _beatmapCharacteristicName: 'Standard';
      _difficultyBeatmaps: [
        {
          _difficulty: 'Easy';
          _difficultyRank: 1;
          _beatmapFilename: 'EasyStandard.dat';
          _noteJumpMovementSpeed: 14;
          _noteJumpStartBeatOffset: -1.1;
          _customData: {
            _editorOffset: 0;
            _editorOldOffset: 0;
            _suggestions: ['Chroma'];
            _obstacleColor: {
              r: 0.732;
              g: 0.732;
              b: 0.732;
            };
          };
        },
        {
          _difficulty: 'Normal';
          _difficultyRank: 3;
          _beatmapFilename: 'NormalStandard.dat';
          _noteJumpMovementSpeed: 15;
          _noteJumpStartBeatOffset: 0.55;
          _customData: {
            _editorOffset: 0;
            _editorOldOffset: 0;
            _suggestions: ['Chroma'];
            _obstacleColor: {
              r: 0.732;
              g: 0.732;
              b: 0.732;
            };
          };
        },
        {
          _difficulty: 'Hard';
          _difficultyRank: 5;
          _beatmapFilename: 'HardStandard.dat';
          _noteJumpMovementSpeed: 16;
          _noteJumpStartBeatOffset: 0.3;
          _customData: {
            _editorOffset: 0;
            _editorOldOffset: 0;
            _suggestions: ['Chroma'];
            _obstacleColor: {
              r: 0.732;
              g: 0.732;
              b: 0.732;
            };
          };
        },
        {
          _difficulty: 'Expert';
          _difficultyRank: 7;
          _beatmapFilename: 'ExpertStandard.dat';
          _noteJumpMovementSpeed: 17;
          _noteJumpStartBeatOffset: 0.05;
          _customData: {
            _editorOffset: 0;
            _editorOldOffset: 0;
            _suggestions: ['Chroma'];
            _obstacleColor: {
              r: 0.732;
              g: 0.732;
              b: 0.732;
            };
          };
        },
        {
          _difficulty: 'ExpertPlus';
          _difficultyRank: 9;
          _beatmapFilename: 'ExpertPlusStandard.dat';
          _noteJumpMovementSpeed: 18;
          _noteJumpStartBeatOffset: -0.1;
          _customData: {
            _editorOffset: 0;
            _editorOldOffset: 0;
            _suggestions: ['Chroma'];
            _obstacleColor: {
              r: 0.732;
              g: 0.732;
              b: 0.732;
            };
          };
        },
      ];
    },
  ];
}

export interface MapDifficultDetail {
  notesTotal: number;
  times: number;
}

export type RavMapDifficultDetail =
  | RavMapDifficultDetailV2
  | RavMapDifficultDetailV3;

export interface RavMapDifficultDetailV2 {
  _version: '2.0.0' | '2.2.0';
  _customData: [];
  _events: { _time: number }[];
  _notes: { _time: number }[];
  _obstacles: [];
  _waypoints?: [];
}

interface RavMapV3ColorNote {
  b: number; // time
  x: number;
  y: number;
  a: number;
  c: number;
  d: number;
}

interface RavMapV3Obstacle {
  b: number;
  x: number;
  y: number;
  d: number;
  w: number;
  h: number;
}

export interface RavMapDifficultDetailV3 {
  version: '3.0.0';
  colorNotes: RavMapV3ColorNote[];
  obstacles: RavMapV3Obstacle[];
  bombNotes: { b: number; x: number; y: number }[];
  lightColorEventBoxGroups: [];
  lightRotationEventBoxGroups: [];
  useNormalEventsAsCompatibleEvents: boolean;
}

export interface MapCacheDetail {
  map: MapCache;
  version: number;
}
