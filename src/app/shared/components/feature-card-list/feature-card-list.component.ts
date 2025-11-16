import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FeatureCard } from '../../models/feature-card.model';

@Component({
  selector: 'app-feature-card-list',
  standalone: true,
  imports: [NgFor, NgIf],
  templateUrl: './feature-card-list.component.html',
  styleUrl: './feature-card-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureCardListComponent {
  @Input({ required: true }) cards: readonly FeatureCard[] = [];
}
