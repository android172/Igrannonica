using FluentValidation;

namespace dotNet.Models
{
    public class KorisnikRegister
    {

        public string KorisnickoIme { get; set; }
        public string Ime { get; set; }
        public string Sifra { get; set; }
        public string Email { get; set; }
    }

    public class KorisnikRegistrationValidator : AbstractValidator<KorisnikRegister>
    {
        public KorisnikRegistrationValidator()
        {
            RuleFor(x => x.KorisnickoIme).NotEmpty().NotNull().MinimumLength(1).MaximumLength(30);
            RuleFor(x => x.Ime).NotEmpty().NotNull().MinimumLength(1).MaximumLength(30);  
            RuleFor(x => x.Sifra).NotEmpty().NotNull().MinimumLength(8).MaximumLength(60);
            RuleFor(x => x.Email).NotEmpty().EmailAddress(); 
        }
    }
}
