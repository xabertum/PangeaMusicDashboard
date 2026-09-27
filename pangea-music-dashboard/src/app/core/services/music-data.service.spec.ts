import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { MusicDataService } from './music-data.service';

describe('MusicDataService', () => {
  let service: MusicDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MusicDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
