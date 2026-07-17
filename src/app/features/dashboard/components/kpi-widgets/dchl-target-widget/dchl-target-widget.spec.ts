import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DchlTargetWidget } from './dchl-target-widget';

describe('DchlTargetWidget', () => {
  let component: DchlTargetWidget;
  let fixture: ComponentFixture<DchlTargetWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DchlTargetWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DchlTargetWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
