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
            RuleFor(x => x.KorisnickoIme).NotEmpty().NotNull().MinimumLength(1).MaximumLength(20)
                .Must(y => ValidUsername(y)).WithMessage("Uneti su nedozvoljeni pocetni karakteri!");
          
            RuleFor(x => x.Ime).NotEmpty().NotNull().MinimumLength(1).MaximumLength(30);  
            RuleFor(x => x.Sifra).NotEmpty().NotNull().MinimumLength(8).MaximumLength(60);
            RuleFor(x => x.Email).NotEmpty().EmailAddress().Must(ValidEmail);
        }

        protected bool ValidEmail(string email)
        {
            email = email.Replace(" ", "");
            return true;
        }
        protected bool ValidUsername(string username)
        {
            username = username.Replace(" ", "");
            username = username.ToLower();

            // regularni izraz 
            if (username[0].Equals('-') || username[0].Equals('_') || username[0].Equals('/') || username[0].Equals('\\') || username[0].Equals('+') || username[0].Equals('=') || username[0].Equals('?') || username[0].Equals('#'))
            {
                return false;
            }
            return true; 
        }
    }
}
