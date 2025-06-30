<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;


final class AuthController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(Request $request, 
        UserPasswordHasherInterface $passwordHasher,
        EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $user = new User();
        $user -> setEmail($data['email']);
        $hashedPassword = $passwordHasher -> hashPassword($user, $data['password']);
        $user -> setPassword($hashedPassword);
        $user -> setRoles(['ROLE_USER']);
        $em -> persist($user);
        $em -> flush();

        return $this->json(['message' => 'Successfully Registered User - Welcome!'], 201 );
    }

    #[Route('/api/login', name: 'api_login', methods: ['POST'])] // Login
    public function login(AuthenticationUtils $authenticationUtils): JsonResponse
    {
        // Lógica de login (que el firewall de seguridad deberia interceptar) ...
        if ($this->getUser()) {
            return $this->json([
                'message' => 'Login successful!',
                'user_identifier' => $this->getUser()->getUserIdentifier(),
            ]);
        }

        $error = $authenticationUtils->getLastAuthenticationError();
        return $this->json([
            'message' => 'Authentication failed.',
            'error'=> $error ? $error->getMessageKey() : null,
        ], Response::HTTP_UNAUTHORIZED);
    }

}
?>