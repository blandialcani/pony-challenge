import { TestBed, inject } from '@angular/core/testing';

import { PonyHelperService } from './pony-helper.service';

describe('PonyHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PonyHelperService]
    });
  });

  it('should be created', inject([PonyHelperService], (service: PonyHelperService) => {
    expect(service).toBeTruthy();
  }));
});
