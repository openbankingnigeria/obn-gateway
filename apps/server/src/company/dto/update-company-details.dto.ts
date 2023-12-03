import { IsNotEmpty, IsNumberString, Length } from 'class-validator';
import { companyValidationErrors } from '../company.config';

export class UpdateCompanyDetailsDto {
  @IsNotEmpty({
    message: ({ property }) => companyValidationErrors.dto.isRequired(property),
  })
  @IsNumberString(
    { no_symbols: true },
    {
      message: ({ property }) =>
        companyValidationErrors.dto.typeMismatch(property, 'numbers'),
    },
  )
  @Length(21, 21, { message: 'rcNumber must be exactly 21 digits long.' })
  rcNumber: string;
}
