# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

# from typing import Any, Text, Dict, List
#
# from rasa_sdk import Action, Tracker
# from rasa_sdk.executor import CollectingDispatcher
#
#
# class ActionHelloWorld(Action):
#
#     def name(self) -> Text:
#         return "action_hello_world"
#
#     def run(self, dispatcher: CollectingDispatcher,
#             tracker: Tracker,
#             domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
#
#         dispatcher.utter_message(text="Hello World!")
#
#         return []



from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
import json
import os
import time

class ActionDetectEmotion(Action):
    def name(self) -> Text:
        return "action_detect_emotion"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        print("ActionDetectEmotion started...")
        
        # Path to the shared emotion data file
        file_path = os.path.join(os.path.expanduser(r"C:\Users\hari\RASA BOTSS\draft2"), "shared_emotion_data.json")
        
        try:
            if os.path.exists(file_path):
                print(f"Found emotion data file at {file_path}")
                with open(file_path, "r") as f:
                    emotion_data = json.load(f)
                
                # Get emotion and make sure it's recent (last 30 seconds)
                emotion = emotion_data.get("emotion", "unknown")
                confidence = emotion_data.get("confidence", 0)
                timestamp = emotion_data.get("timestamp", 0)
                
                time_diff = time.time() - timestamp
                print(f"Detected emotion: {emotion}, confidence: {confidence}, time diff: {time_diff}s")
                
                # Check if data is recent
                if time_diff > 30:
                    print("Emotion data is too old (> 30s)")
                    dispatcher.utter_message(text="I can see you, but I'm not sure what you're feeling right now.")
                    return [SlotSet("detected_emotion", "use_text_intents")]  # Changed to match rule
                
                # Map the emotion detection labels to your bot's intents
                emotion_to_intent = {
                    "happy": "mood_great",
                    "sad": "mood_unhappy",
                    "angry": "mood_angry",
                    "disgust": "mood_disgust",
                    "fear": "mood_anxious",
                    "surprised": "mood_surprise",
                    "neutral": "mood_neutral"
                }
                
                # Get corresponding intent
                mapped_intent = emotion_to_intent.get(emotion.lower(), "unknown")
                print(f"Mapped emotion {emotion} to intent {mapped_intent}")
                
                # Set the detected emotion as a slot
                return [SlotSet("detected_emotion", mapped_intent)]
            else:
                print(f"Emotion data file not found at {file_path}")
                return [SlotSet("detected_emotion", "unknown")]
        except Exception as e:
            print(f"Error reading emotion: {e}")
            return [SlotSet("detected_emotion", "unknown")]

class ActionRespondToDetectedEmotion(Action):
    def name(self) -> Text:
        return "action_respond_to_detected_emotion"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the detected emotion slot
        detected_emotion = tracker.get_slot("detected_emotion")
        print(f"ActionRespondToDetectedEmotion received emotion: {detected_emotion}")
        
        # Respond based on detected emotion
        if detected_emotion == "mood_great":
            dispatcher.utter_message(response="utter_happy")
        elif detected_emotion == "mood_unhappy":
            dispatcher.utter_message(response="utter_sad")
        elif detected_emotion == "mood_angry":
            dispatcher.utter_message(response="utter_anger")
        elif detected_emotion == "mood_anxious":
            dispatcher.utter_message(response="utter_anxious")
        elif detected_emotion == "mood_disgust":
            dispatcher.utter_message(response="utter_disgust")
        elif detected_emotion == "mood_neutral":
            dispatcher.utter_message(response="utter_neutral")
        elif detected_emotion == "mood_surprise":
            dispatcher.utter_message(response="utter_surprised")
        elif detected_emotion == "use_text_intents":
            # Fall back to text-based intent recognition
            # We don't send a message here because we want the flow to continue
            # naturally and let the bot match the user's text input to intents
            print("Falling back to text-based intent recognition")
            pass
        elif detected_emotion == "unknown" or detected_emotion is None:
            # When we can't determine the emotion from visual cues
            dispatcher.utter_message(text="I notice your expression, but I'm not quite sure what you're feeling. Would you like to tell me?")
        else:
            # Unexpected value - log it for debugging
            print(f"WARNING: Unexpected detected_emotion value: {detected_emotion}")
            dispatcher.utter_message(text="I notice your expression, but I'm not quite sure what you're feeling. Would you like to tell me?")
        
        return []

class ActionContinueEmotionalSupport(Action):
    def name(self) -> Text:
        return "action_continue_emotional_support"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Get the current emotion from the slot or latest intent
        latest_intent = tracker.latest_message.get('intent', {}).get('name', None)
        mood_intents = ["mood_great", "mood_unhappy", "mood_angry", 
                         "mood_anxious", "mood_disgust", "mood_neutral", 
                         "mood_surprised"]
        
        # Debug print
        current_emotion_slot = tracker.get_slot("detected_emotion")
        print(f"Latest intent: {latest_intent}, Current detected_emotion: {current_emotion_slot}")
        
        # PRIORITIZE VISUAL DATA FIRST:
        # Visual data is available and valid (not 'use_text_intents' or 'unknown')
        if current_emotion_slot in mood_intents:
            current_emotion = current_emotion_slot
            print(f"Using visual emotion: {current_emotion}")
        
        # SECOND PRIORITY - TEXT DATA:
        # Check for emotion in latest message
        elif latest_intent in mood_intents:
            current_emotion = latest_intent
            print(f"Using text emotion from latest message: {current_emotion}")
        
        # THIRD PRIORITY - CONVERSATION HISTORY:
        # Check conversation history for previous emotions
        else:
            # If "use_text_intents" or any other non-mood value, 
            # check previous conversation for context
            events = tracker.events
            for e in reversed(events):
                if e.get('event') == 'user' and e.get('parse_data', {}).get('intent', {}).get('name') in mood_intents:
                    current_emotion = e.get('parse_data', {}).get('intent', {}).get('name')
                    print(f"Using previous emotion from conversation: {current_emotion}")
                    break
            else:
                # No previous emotion found, default to neutral
                current_emotion = "mood_neutral"
                print("No previous emotion found, defaulting to neutral")
        
        # Respond based on current emotion
        if current_emotion == "mood_great":
            dispatcher.utter_message(response="utter_happy")
        elif current_emotion == "mood_unhappy":
            dispatcher.utter_message(response="utter_sad")
        elif current_emotion == "mood_angry":
            dispatcher.utter_message(response="utter_anger")
        elif current_emotion == "mood_anxious":
            dispatcher.utter_message(response="utter_anxious")
        elif current_emotion == "mood_disgust":
            dispatcher.utter_message(response="utter_disgust")
        elif current_emotion == "mood_neutral":
            dispatcher.utter_message(response="utter_neutral")
        elif current_emotion == "mood_surprised":
            dispatcher.utter_message(response="utter_surprised")
        
        # Ask if it helped
        dispatcher.utter_message(response="utter_did_that_help")
        
        # Preserve the current emotion
        return [SlotSet("detected_emotion", current_emotion)]