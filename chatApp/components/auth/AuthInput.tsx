import { TextInput, TextInputProps } from 'react-native';

//new
// one input style for every auth screen (gray pill from the Figma)
export default function AuthInput(props: TextInputProps) {
  return (
    <TextInput
      className="h-14 rounded-2xl bg-[#E8E8E6] px-4 text-base text-gray-900"
      placeholderTextColor="#8A8A8A"
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
}