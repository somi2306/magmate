import { PartialType } from '@nestjs/mapped-types';
import { CreatePrestataireDto } from './create-prestataire.dto';

export class UpdatePrestataireDto extends PartialType(CreatePrestataireDto) {
  disponibilite?: boolean;
}
