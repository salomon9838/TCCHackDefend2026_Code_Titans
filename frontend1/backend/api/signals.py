"""
Signals for the API app to auto-seed test users on startup
"""
import logging
from django.db.models.signals import post_migrate
from django.dispatch import receiver
from django.core.management import call_command
from .models import User

logger = logging.getLogger(__name__)


@receiver(post_migrate)
def create_test_users_on_migrate(sender, **kwargs):
    """Create test users after migrations are run"""
    if sender.name != 'api':
        return
    
    test_users = [
        {
            'email': 'merchant@demo.local',
            'telephone': '+228 91234567',
            'nom': 'Dupont',
            'prenom': 'Jean',
            'role': 'merchant',
            'password': 'Demo123!@',
        },
        {
            'email': 'customer@demo.local',
            'telephone': '+228 91234568',
            'nom': 'Martin',
            'prenom': 'Paul',
            'role': 'customer',
            'password': 'Demo123!@',
        },
        {
            'email': 'partner@demo.local',
            'telephone': '+228 91234569',
            'nom': 'Diouf',
            'prenom': 'Fatou',
            'role': 'partner',
            'password': 'Demo123!@',
        },
    ]
    
    for user_data in test_users:
        user, created = User.objects.get_or_create(
            email=user_data['email'],
            defaults={
                'username': user_data['email'].lower(),
                'telephone': user_data['telephone'],
                'nom': user_data['nom'],
                'prenom': user_data['prenom'],
                'role': user_data['role'],
                'is_active': True,
            }
        )
        if created:
            user.set_password(user_data['password'])
            user.save()
            logger.info(f"✓ Created test user: {user_data['email']}")
        else:
            user.set_password(user_data['password'])
            user.save()
            logger.info(f"✓ Updated test user: {user_data['email']}")
